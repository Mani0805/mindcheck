
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const News = require("./models/News");
const analyzeNewsWithAI = require("./services/aiAnalyzer");
const {
    searchRelatedInformation
} = require("./services/tavilyService");

const app = express();

app.use(cors());
app.use(express.json());


// =============================
// MONGODB CONNECTION
// =============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });


// =============================
// HOME ROUTE
// =============================

app.get("/", (req, res) => {
    res.json({
        message: "Misinformation Detection API is running!"
    });
});


// =============================
// ANALYZE + SAVE NEWS
// =============================

app.post("/api/news", async (req, res) => {
    console.log("POST /api/news RECEIVED");
    try {
        const { title, content } = req.body;

        // Validate input
        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const cleanTitle = title.trim();
        const cleanContent = content.trim();

        // Step 1: Search for evidence and latest related news
        let sources = [];
        let latestNews = [];
        let searchWarning = null;

        // Extract an explicitly stated publication date from the article.
// Do not assume that the article's publication date is today's date.
function extractArticleDate(text = "") {
    const patterns = [
        /\b(20\d{2})-(\d{2})-(\d{2})\b/,
        /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i,
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})\b/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (!match) continue;

        let year, month, day;

        if (pattern === patterns[0]) {
            [, year, month, day] = match;
        } else if (pattern === patterns[1]) {
            day = match[1];
            month = String(
                new Date(`${match[2]} 1, ${match[3]}`).getMonth() + 1
            );
            year = match[3];
        } else {
            month = String(
                new Date(`${match[1]} 1, ${match[3]}`).getMonth() + 1
            );
            day = match[2];
            year = match[3];
        }

        const isoDate =
            `${year}-${month.padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const parsed = new Date(`${isoDate}T00:00:00Z`);

        if (
            !Number.isNaN(parsed.getTime()) &&
            parsed.toISOString().slice(0, 10) === isoDate
        ) {
            return isoDate;
        }
    }

    return null;
}

const articleText = `${cleanTitle}\n${cleanContent}`;
const articleDate = extractArticleDate(articleText);

// Pass the article date explicitly so the search service can use it.
const query = [
    `ARTICLE TITLE: ${cleanTitle}`,
    `ARTICLE PUBLICATION DATE: ${articleDate || "Unknown"}`,
    `ARTICLE CONTENT: ${cleanContent.slice(0, 1500)}`
].join("\n");

console.log("ARTICLE SUBMITTED:", cleanTitle);
console.log("ARTICLE PUBLICATION DATE:", articleDate || "Unknown");

        try {
            const searchResults =
                await searchRelatedInformation(query);

            sources = searchResults.sources || [];
            latestNews = searchResults.latestNews || [];
            searchWarning = searchResults.searchWarning || null;

        } catch (searchError) {
            console.error(
                "Tavily search error:",
                searchError.message
            );

            searchWarning =
                "External source search was unavailable.";
        }

        console.log("TAVILY EVIDENCE SOURCES:", sources);
        console.log("LATEST RELATED NEWS:", latestNews);

        // Step 2: Analyze the article and available evidence with Groq
        const result = await analyzeNewsWithAI(
            cleanTitle,
            cleanContent,
            sources
        );

        console.log("AI RESULT:", result);

        // Step 3: Save the analysis and evidence in MongoDB
        const news = new News({
            title: cleanTitle,
            content: cleanContent,
            prediction: result.prediction,
            confidence: result.confidence,
            analysis: result.analysis,
            keyClaims: result.keyClaims,
            recommendation: result.recommendation,
            sources: sources
        });

        const savedNews = await news.save();

        // Step 4: Return analysis, evidence, and latest news
        return res.status(201).json({
            message: "News analyzed and saved successfully!",
            result: {
                prediction: result.prediction,
                confidence: result.confidence,
                analysis: result.analysis,
                keyClaims: result.keyClaims,
                recommendation: result.recommendation,
                sources: sources,
                latestNews: latestNews,
                searchWarning: searchWarning
            },
            news: savedNews
        });

    } catch (error) {
        console.error("AI Analysis error:", error);

        return res.status(500).json({
            message: "Failed to analyze news",
            error: error.message
        });
    }
});


// =============================
// GET ANALYSIS HISTORY
// =============================

app.get("/api/news", async (req, res) => {
    try {
        const newsHistory = await News.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "News history retrieved successfully!",
            news: newsHistory
        });

    } catch (error) {
        console.error("History error:", error);

        return res.status(500).json({
            message: "Failed to retrieve news history",
            error: error.message
        });
    }
});


// =============================
// START SERVER
// =============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});
