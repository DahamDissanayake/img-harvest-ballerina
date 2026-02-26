// ImgHarvest — Shared Record Types

// Request from the frontend to search for images
public type SearchRequest record {|
    string keyword;
    int count = 20;
    string sessionEmail;
    string userId;
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

// Request from the frontend to download selected images as a ZIP
public type DownloadRequest record {|
    string sessionEmail;
    string format = "original"; // kept for compatibility, not used
    string[] imageUrls;
|};

// Error response
public type ErrorResponse record {|
    string message;
    string? detail = ();
|};

// AI search refinement request
public type RefineRequest record {|
    string keyword;
|};

// AI search refinement response
public type RefineResponse record {|
    string original;
    string refined;
|};
