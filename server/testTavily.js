
require("dotenv").config();

const searchEvidence = require("./services/tavilyService");

async function testTavily() {
    try {
        const results = await searchEvidence(
            "official government announcement Tamil Nadu college closure"
        );

        console.log("\nTAVILY SEARCH RESULTS:\n");

        if (results.length === 0) {
            console.log("No search results were returned.");
            return;
        }

        results.forEach((item, index) => {
            console.log(`\nSource ${index + 1}`);
            console.log("Title:", item.title);
            console.log("Published date:", item.publishedDate || "Not provided");
            console.log("URL:", item.url);
            console.log("Evidence:", item.content);
            console.log("Relevance score:", item.score);
        });
    } catch (error) {
        console.error("Tavily test failed:", error.message);
    }
}

testTavily();
