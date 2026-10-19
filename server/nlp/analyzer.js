const natural = require("natural");

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Words commonly found in potentially misleading/sensational news
const misleadingWords = [
    "shocking",
    "breaking",
    "secret",
    "exposed",
    "miracle",
    "guaranteed",
    "scandal",
    " unbelievable",
    "urgent",
    "viral",
    "fake",
    "rumor",
    "rumour",
    "conspiracy",
    "click here",
    "you won't believe"
];

// Words that can indicate more neutral/reliable reporting
const reliableWords = [
    "according",
    "report",
    "official",
    "statement",
    "government",
    "research",
    "study",
    "data",
    "source",
    "evidence",
    "confirmed",
    "published"
];

function analyzeNews(title, content) {
    const text = `${title} ${content}`.toLowerCase();

    // Tokenization
    const tokens = tokenizer.tokenize(text);

    // Stemming
    const stems = tokens.map((token) => stemmer.stem(token));

    let misleadingCount = 0;
    let reliableCount = 0;

    const detectedMisleadingWords = [];
    const detectedReliableWords = [];

    // Check misleading patterns
    misleadingWords.forEach((word) => {
        if (text.includes(word.trim())) {
            misleadingCount++;
            detectedMisleadingWords.push(word.trim());
        }
    });

    // Check reliable patterns
    reliableWords.forEach((word) => {
        if (text.includes(word)) {
            reliableCount++;
            detectedReliableWords.push(word);
        }
    });

    const totalSignals = misleadingCount + reliableCount;

    let prediction = "Needs Further Verification";
    let confidence = 50;

    if (totalSignals > 0) {
        confidence =
            50 +
            ((reliableCount - misleadingCount) / totalSignals) * 40;

        if (misleadingCount > reliableCount) {
            prediction = "Potentially Misleading";
        } else if (reliableCount > misleadingCount) {
            prediction = "More Reliable";
        }
    }

    // Keep confidence between 0 and 100
    confidence = Math.max(0, Math.min(100, confidence));

    let analysis = "";

    if (detectedMisleadingWords.length > 0) {
        analysis += `Potentially misleading signals detected: ${detectedMisleadingWords.join(", ")}. `;
    }

    if (detectedReliableWords.length > 0) {
        analysis += `Reliability-related signals detected: ${detectedReliableWords.join(", ")}. `;
    }

    if (analysis === "") {
        analysis =
            "No strong linguistic signals were detected. Further verification is recommended.";
    }

    return {
        prediction,
        confidence: Math.round(confidence),
        analysis,
        wordCount: tokens.length,
        stemCount: stems.length
    };
}

module.exports = analyzeNews;