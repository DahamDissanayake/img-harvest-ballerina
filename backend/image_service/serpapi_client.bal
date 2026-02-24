// ImgHarvest — SerpApi HTTP Client

import ballerina/http;
import ballerina/log;
import ballerina/os;
import ballerina/lang.array;

configurable string serpApiKey = os:getEnv("SERPAPI_KEY");

final http:Client serpApiClient = check new ("https://serpapi.com");

// Fetch image results from SerpApi Google Images engine
public function searchImages(string keyword, int count, string sessionEmail) returns ImageResult[]|error {
    log:printInfo("Searching SerpApi", keyword = keyword, count = count);

    http:Response response = check serpApiClient->get(
        string `/search?engine=google_images&q=${keyword}&num=${count}&api_key=${serpApiKey}&safe=active`
    );

    if response.statusCode != 200 {
        string body = check response.getTextPayload();
        log:printError("SerpApi error", statusCode = response.statusCode, body = body);
        return error(string `SerpApi returned status ${response.statusCode}`);
    }

    json payload = check response.getJsonPayload();
    json[] rawImages = <json[]>check payload.images_results;

    ImageResult[] results = [];
    int idx = 0;

    foreach json img in rawImages {
        if idx >= count {
            break;
        }
        string|error imgUrl = img.original.ensureType(string);
        string|error thumb = img.thumbnail.ensureType(string);
        string|error title = img.title.ensureType(string);

        if imgUrl is error || thumb is error {
            continue; // skip malformed entries
        }

        results.push({
            id: string `${sessionEmail}-${idx}`,
            url: imgUrl is string ? imgUrl : "",
            thumbnail: thumb is string ? thumb : "",
            title: title is string ? title : "Untitled",
            width: (),
            height: ()
        });
        idx += 1;
    }

    log:printInfo("SerpApi returned results", count = results.length());
    return results;
}
