// ImgHarvest — Main Ballerina HTTP Service
// Endpoints:
//   POST /api/search   → search images via SerpApi
//   POST /api/download → download, convert, and ZIP selected images

import ballerina/http;
import ballerina/log;
import ballerina/io;
import ballerina/mime;

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
        log:printInfo("Search request", keyword = req.keyword, count = req.count, format = req.format);

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

    // ── Download ─────────────────────────────────────────────────────────────
    resource function post download(@http:Payload DownloadRequest req)
            returns http:Response|http:InternalServerError {

        log:printInfo("Download request", count = req.imageUrls.length(), format = req.format);

        // Create HTTP client for downloading images
        http:Client|error imgClient = new ("https://placeholder.invalid");
        // We'll use separate clients per URL inside the helper

        byte[]|error zipBytes = buildZip(req.imageUrls, req.format);

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

function buildZip(string[] urls, string format) returns byte[]|error {
    // Collect all (filename, bytes) pairs
    map<byte[]> files = {};
    int counter = 1;

    foreach string url in urls {
        byte[]|error rawBytes = fetchImageBytes(url);

        if rawBytes is error {
            log:printWarn("Skipping image", url = url, reason = rawBytes.message());
            continue;
        }

        byte[]|error converted = convertImageFormat(rawBytes, format);
        if converted is error {
            log:printWarn("Conversion failed, using original", url = url, reason = converted.message());
            // fallback: store original bytes
            files[string `image_${counter}.${format}`] = rawBytes;
        } else {
            files[string `image_${counter}.${format}`] = converted;
        }
        counter += 1;
    }

    if files.length() == 0 {
        return error("No images could be downloaded");
    }

    return createZipBytes(files);
}

// Fetch raw bytes from a URL using Ballerina HTTP client
function fetchImageBytes(string url) returns byte[]|error {
    // Parse scheme and host from URL and create a targeted client
    http:Client client = check new (url);
    http:Response resp = check client->get("/");
    if resp.statusCode != 200 {
        return error(string `HTTP ${resp.statusCode} for ${url}`);
    }
    return resp.getBinaryPayload();
}

// Build in-memory ZIP from a map of filename → bytes using Java
function createZipBytes(map<byte[]> files) returns byte[]|error {
    return buildZipViaJava(files);
}

// Java interop for ZIP creation
function buildZipViaJava(map<byte[]> files) returns byte[]|error {
    // Flatten entries into parallel arrays for Java call
    string[] names = files.keys();
    byte[][] contentArrays = [];
    foreach string name in names {
        contentArrays.push(files.get(name) ?: []);
    }
    return zipFiles(names, contentArrays);
}

// Java method binding for ZIP utility
function zipFiles(string[] names, byte[][] contents) returns byte[]|error = @java:Method {
    name: "createZip",
    'class: "org.imgharvest.ImageConverter",
    paramTypes: ["[Ljava.lang.String;", "[[B"]
} external;
