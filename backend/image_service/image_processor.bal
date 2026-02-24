// ImgHarvest — Java Interop Bridge for Image Conversion

import ballerina/jballerina.java;

# Convert raw image bytes to the specified format using Java ImageIO.
# Supported formats: "png", "jpg", "webp"
#
# + imageBytes - Raw bytes of the source image
# + targetFormat - Target format string e.g. "png", "jpg", "webp"
# + return - Converted image bytes, or an error if conversion fails
public function convertImageFormat(byte[] imageBytes, string targetFormat) returns byte[]|error {
    handle jBytes = check convertToJavaBytes(imageBytes);
    handle jFormat = java:fromString(targetFormat);
    return invokeConvert(jBytes, jFormat);
}

function convertToJavaBytes(byte[] arr) returns handle|error = @java:Method {
    name: "toJavaBytes",
    'class: "org.imgharvest.ImageConverter"
} external;

function invokeConvert(handle imageBytes, handle format) returns byte[]|error = @java:Method {
    name: "convert",
    'class: "org.imgharvest.ImageConverter",
    paramTypes: ["[B", "java.lang.String"]
} external;
