// ImgHarvest — AI Search Refiner (Groq API — Free, OpenAI-compatible)

import ballerina/http;
import ballerina/log;
import ballerina/lang.runtime;
import ballerina/cache;

configurable string groqApiKey = "";

final http:Client groqClient = check new ("https://api.groq.com", {
    httpVersion: http:HTTP_1_1
});

// In-memory cache (TTL: 10 minutes, max 100 entries)
final cache:Cache queryCache = new ({
    capacity: 100,
    evictionFactor: 0.25,
    defaultMaxAge: 600
});

final string REFINE_SYSTEM_PROMPT = string `You are a world-class search query specialist. Users give you rough, messy descriptions of images they want to find. You must deeply reason about their TRUE intention, then craft the perfect Google Image Search query.

THINK STEP BY STEP:
1. What EXACTLY is the user trying to find? Read between the lines.
2. What specific CATEGORY is this? (animal, food, architecture, nature, tech, person, art, etc.)
3. What DETAILS matter? (color, size, age, location, style, angle, lighting, mood)
4. What PROPER TERMS exist? (scientific names, technical jargon, regional names, style names)
5. What MODIFIERS would narrow the results? (close-up, aerial, macro, candid, studio, wild, etc.)

INTELLIGENCE RULES:
- If a user mentions an animal → add the proper species name and habitat context
- If a user mentions a place → add architectural style or geographic descriptors
- If a user mentions food → add cuisine type and presentation style
- If a user mentions tech → add proper technical terminology
- If a user says "babies" or "baby" for animals → use "juvenile" or "baby" + species name
- If a user mentions colors → keep them, they indicate specific visual preference
- If a user mentions "native" or regional terms → add the geographic region and local species names
- ALWAYS fix typos silently
- NEVER explain, NEVER add quotes — output ONLY the refined query
- Keep to 4-12 words, be laser-focused

EXAMPLES:
Input: "Sri lankan native, squrrel babbies"
Output: baby Sri Lankan giant squirrel juvenile wildlife

Input: "cute dogs in snow"
Output: playful puppies running in fresh snow winter

Input: "old temples in asia"  
Output: ancient Buddhist temple ruins Southeast Asia

Input: "those small colorful birds"
Output: tropical hummingbird colorful iridescent close-up

Input: "electronic circuit thing zoomed in"
Output: PCB printed circuit board macro photography detail

Input: "fancy cake decoration"
Output: elegant fondant wedding cake decoration artisan

Input: "mountains with fog and trees"
Output: misty mountain forest landscape fog sunrise

Input: "brown mushrooms growing on wood"
Output: wild brown bracket fungus growing on log forest

Input: "people working in old factory"
Output: industrial factory workers vintage manufacturing floor

Input: "house plants that hang down"
Output: trailing indoor hanging plants pothos string of pearls

Input: "fast cars red color"
Output: red sports car supercar dynamic motion shot`;


public function refineSearchQuery(string keyword) returns string|error {
    log:printInfo("Refining search query with Groq", keyword = keyword);

    if groqApiKey == "" || groqApiKey == "YOUR_GROQ_API_KEY_HERE" {
        return error("Groq API key not configured in Config.toml");
    }

    // Check cache first
    string cacheKey = keyword.toLowerAscii().trim();
    any|cache:Error cached = queryCache.get(cacheKey);
    if cached is string {
        log:printInfo("Cache hit", keyword = keyword, refined = cached);
        return cached;
    }

    json requestBody = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": REFINE_SYSTEM_PROMPT},
            {"role": "user", "content": keyword}
        ],
        "temperature": 0.3,
        "max_tokens": 30
    };

    http:Response response;
    int retries = 0;

    while true {
        http:Request req = new;
        req.setJsonPayload(requestBody);
        req.setHeader("Authorization", string `Bearer ${groqApiKey}`);
        req.setHeader("Content-Type", "application/json");

        response = check groqClient->post("/openai/v1/chat/completions", req);

        if response.statusCode == 429 && retries < 2 {
            retries += 1;
            log:printInfo("Groq rate limited, retrying...", attempt = retries);
            runtime:sleep(5);
            continue;
        }
        break;
    }

    if response.statusCode == 429 {
        log:printError("Groq rate limit exceeded");
        return error("AI service is busy. Please wait a moment and try again.");
    }

    if response.statusCode != 200 {
        string body = check response.getTextPayload();
        log:printError("Groq API error", statusCode = response.statusCode, body = body);
        return error(string `Groq API returned status ${response.statusCode}`);
    }

    json payload = check response.getJsonPayload();

    // Extract: choices[0].message.content (same as OpenAI format)
    json[] choices = <json[]>check payload.choices;
    json firstChoice = choices[0];
    json message = check firstChoice.message;
    string refinedText = check message.content.ensureType(string);

    string refined = refinedText.trim();

    // Cache result
    cache:Error? cacheErr = queryCache.put(cacheKey, refined);
    if cacheErr is cache:Error {
        log:printError("Cache error", 'error = cacheErr);
    }

    log:printInfo("Refined query", original = keyword, refined = refined);
    return refined;
}
