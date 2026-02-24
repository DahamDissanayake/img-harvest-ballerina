// ImgHarvest — Shared Record Types

// Request from the frontend to search for images
public type SearchRequest record {|
    string keyword;
    int count = 20;
    string format = "png"; // "png" | "jpg" | "webp"
    string sessionEmail;
|};

// Single image result returned from SerpApi
public type ImageResult record {|
    string id;
    string url;
    string thumbnail;
    string title;
    int width?;
    int height?;
|};

// Search response envelope
public type SearchResponse record {|
    ImageResult[] images;
    string sessionEmail;
    string keyword;
    int total;
|};

// Request from the frontend to download + convert selected images
public type DownloadRequest record {|
    string sessionEmail;
    string format; // "png" | "jpg" | "webp"
    string[] imageUrls;
|};

// Error response
public type ErrorResponse record {|
    string message;
    string? detail = ();
|};
