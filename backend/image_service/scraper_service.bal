// ImgHarvest — Main Ballerina HTTP Service
// Endpoints:
//   POST /api/search   → search images via SerpApi
//   POST /api/download → download, convert, and ZIP selected images

import ballerina/http;
import ballerina/jballerina.java;
import ballerina/lang.'array;
import ballerina/log;

// ─── HTTP Service ────────────────────────────────────────────────────────────

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: false,
        maxAge: 84900
    }
}
service /api on new http:Listener(9090) {

    // ── Search ───────────────────────────────────────────────────────────────
    resource function post search(@http:Payload SearchRequest req) returns SearchResponse|http:InternalServerError {
        log:printInfo("Search request", keyword = req.keyword, count = req.count);

        ImageResult[]|error results = searchImages(req.keyword, req.count, req.sessionEmail);

        if results is error {
            log:printError("Search failed", 'error = results);
            return <http:InternalServerError>{
                body: <ErrorResponse>{message: "Search failed", detail: results.message()}
            };
        }

        return {
            images: results,
            sessionEmail: req.sessionEmail,
            keyword: req.keyword,
            total: results.length()
        };
    }

    // ── Refine search query with AI ──────────────────────────────────────────
    resource function post refine(@http:Payload RefineRequest req) returns RefineResponse|http:InternalServerError {
        log:printInfo("Refine request", keyword = req.keyword);

        string|error refined = refineSearchQuery(req.keyword);

        if refined is error {
            log:printError("Refine failed", 'error = refined);
            return <http:InternalServerError>{
                body: <ErrorResponse>{message: "Refinement failed", detail: refined.message()}
            };
        }

        return {
            original: req.keyword,
            refined: refined
        };
    }

    resource function post download(@http:Payload DownloadRequest req)
            returns http:Response|http:InternalServerError {

        log:printInfo("Download request", count = req.imageUrls.length());

        byte[]|error zipBytes = buildZip(req.imageUrls);

        if zipBytes is error {
            log:printError("ZIP build failed", 'error = zipBytes);
            return <http:InternalServerError>{
                body: <ErrorResponse>{message: "Download failed", detail: zipBytes.message()}
            };
        }

        http:Response response = new;
        response.setHeader("Content-Type", "application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=\"dataset.zip\"");
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setBinaryPayload(zipBytes, "application/zip");
        return response;
    }
}

// ─── ZIP Builder ─────────────────────────────────────────────────────────────

function buildZip(string[] urls) returns byte[]|error {
    map<byte[]> files = {};
    int counter = 1;

    foreach string url in urls {
        byte[]|error rawBytes = fetchImageBytes(url);

        if rawBytes is error {
            log:printWarn("Skipping image", url = url, reason = rawBytes.message());
            continue;
        }

        // Derive extension from URL (strip query params and fragment)
        int endIdx = url.length();
        int? qIdx = url.indexOf("?");
        int? hIdx = url.indexOf("#");
        if qIdx is int { endIdx = qIdx; }
        if hIdx is int && hIdx < endIdx { endIdx = hIdx; }
        string cleanUrl = url.substring(0, endIdx);

        string ext = "jpg";
        int? dotIdx = cleanUrl.lastIndexOf(".");
        if dotIdx is int {
            string candidate = cleanUrl.substring(dotIdx + 1).toLowerAscii();
            if candidate == "png" || candidate == "jpg" || candidate == "jpeg" || candidate == "webp" || candidate == "gif" {
                ext = candidate;
            }
        }

        files[string `image_${counter}.${ext}`] = rawBytes;
        counter += 1;
    }

    if files.length() == 0 {
        return error("No images could be downloaded");
    }

    return createZipBytes(files);
}

// Fetch raw bytes from a URL using Ballerina HTTP client
function fetchImageBytes(string url) returns byte[]|error {
    // Use the full URL as the client base; empty path means fetch base URL as-is
    http:Client imgClient = check new(url);
    http:Response resp = check imgClient->get("");
    if resp.statusCode != 200 {
        return error(string `HTTP ${resp.statusCode} for ${url}`);
    }
    return resp.getBinaryPayload();
}

// ─── ZIP via Java Interop (Base64 + handle — no type-mapping issues) ─────────
//
// WHY BASE64?
// Ballerina cannot pass `byte[]` or `string` to Java directly — the JVM
// expects BString / BArray, which need the Ballerina runtime JAR at compile
// time. Using `handle` (opaque Java object reference) plus Base64 encoding
// bypasses the problem entirely.
//
// Flow:  Ballerina byte[] → toBase64 → java:fromString → Java String
//        Java String → java:toString → Ballerina string → fromBase64 → byte[]

function createZipBytes(map<byte[]> files) returns byte[]|error {
    handle builder = newZipCreator();
    foreach [string, byte[]] [name, content] in files.entries() {
        handle jName = java:fromString(name);
        // Encode bytes as Base64 string, then pass as Java String handle
        string base64Content = content.toBase64();
        handle jBase64Content = java:fromString(base64Content);
        check javaAddEntry(builder, jName, jBase64Content);
    }
    handle resultHandle = check javaFinish(builder);
    // Convert Java String handle → Ballerina string → decode Base64 → byte[]
    string? base64Result = java:toString(resultHandle);
    if base64Result is () {
        return error("ZIP creation returned null");
    }
    return 'array:fromBase64(base64Result);
}

// ─── Java Interop Bindings ───────────────────────────────────────────────────

// Construct a new ZipCreator instance (public no-arg constructor)
function newZipCreator() returns handle = @java:Constructor {
    'class: "backend.image_service.libs.ZipCreator"
} external;

// Add one file entry: both params are Java String handles
function javaAddEntry(handle zipCreator, handle name, handle base64Content) returns error? = @java:Method {
    name: "addEntry",
    'class: "backend.image_service.libs.ZipCreator"
} external;

// Close the ZIP — returns a Java String handle (Base64-encoded ZIP bytes)
function javaFinish(handle zipCreator) returns handle|error = @java:Method {
    name: "finish",
    'class: "backend.image_service.libs.ZipCreator"
} external;
