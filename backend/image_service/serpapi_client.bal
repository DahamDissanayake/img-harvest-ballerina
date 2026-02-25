// ImgHarvest — SerpApi HTTP Client (with pagination for up to 500 results)

import ballerina/http;
import ballerina/log;
import ballerina/os;

configurable string serpApiKey = os:getEnv("SERPAPI_KEY");

final http:Client serpApiClient = check new ("https://serpapi.com");

// Fetch image results from SerpApi Google Images engine.
// Supports up to 500 images by paginating across multiple pages (ijn parameter).
public function searchImages(string keyword, int count, string sessionEmail) returns ImageResult[]|error {
    log:printInfo("Searching SerpApi", keyword = keyword, count = count);

    ImageResult[] results = [];
    int page = 0;
    int maxPages = 5; // Each page returns ~100 results, so 5 pages → 500

    while results.length() < count && page < maxPages {
        int remaining = count - results.length();

        http:Response response = check serpApiClient->get(
            string `/search?engine=google_images&q=${keyword}&num=${remaining}&ijn=${page}&api_key=${serpApiKey}&safe=active`
        );

        if response.statusCode != 200 {
            string body = check response.getTextPayload();
            log:printError("SerpApi error", statusCode = response.statusCode, body = body);
            // If we already have some results, return them instead of failing
            if results.length() > 0 {
                log:printWarn("Returning partial results", collected = results.length());
                break;
            }
            return error(string `SerpApi returned status ${response.statusCode}`);
        }

        json payload = check response.getJsonPayload();
        json[]|error rawImages = payload.images_results.ensureType();

        if rawImages is error {
            log:printWarn("No images_results in page", page = page);
            break;
        }

        int addedThisPage = 0;

        foreach json img in rawImages {
            if results.length() >= count {
                break;
            }
            string|error imgUrl = img.original.ensureType(string);
            string|error thumb = img.thumbnail.ensureType(string);
            string|error title = img.title.ensureType(string);

            if imgUrl is error || thumb is error {
                continue; // skip malformed entries
            }

            int idx = results.length();
            results.push({
                id: string `${sessionEmail}-${idx}`,
                url: imgUrl,
                thumbnail: thumb,
                title: title is string ? title : "Untitled",
                width: (),
                height: ()
            });
            addedThisPage += 1;
        }

        // If this page returned nothing new, stop paginating
        if addedThisPage == 0 {
            break;
        }

        page += 1;
    }

    log:printInfo("SerpApi returned results", count = results.length());
    return results;
}
