import ballerina/http;
import ballerinax/webscraping.ai as wa; // Import the official connector
import ballerina/lang.regexp;

// Configuration for the Scraper API
configurable string apiKey = ?;

service /image\-scraper on new http:Listener(9090) {

    // Resource function to handle the scraping request
    resource function get search(string keywords, int count) returns string[]|error {
        
        // 1. Initialize the WebScraping.ai client
        wa:ApiKeysConfig config = {api_key: apiKey};
        wa:Client scraperClient = check new (config);

        // 2. Build the search URL (using Unsplash or Google Images as a target)
        string searchUrl = string `https://unsplash.com/s/photos/${keywords}`;

        // 3. Fetch the rendered HTML (js=true allows it to load dynamic images)
        string htmlContent = check scraperClient->getHTML(url = searchUrl, js = true);

        // 4. Extract image URLs using Regex
        // We look for 'src' attributes within <img> tags that look like valid image links
        string[] imageUrls = [];
        regexp:RegExp imagePattern = re `<img[^>]+src="([^">]+)"`;
        
        // Find all matches in the HTML
        var matches = imagePattern.findAll(htmlContent);
        
        // Loop through matches and collect the URLs (Group 1 is the URL)
        foreach var m in matches {
            if (imageUrls.length() < count) {
                imageUrls.push(m.groups()[1].toString());
            }
        }

        return imageUrls;
    }
}