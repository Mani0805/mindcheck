
const TAVILY_API_URL = "https://api.tavily.com/search";

const TRUSTED_DOMAINS = [
    "reuters.com",
    "apnews.com",
    "bbc.com",
    "thehindu.com",
    "indianexpress.com",
    "pib.gov.in",
    "rbi.org.in",
    "nseindia.com",
    "bseindia.com",
    "sebi.gov.in",
    "who.int",
    "cdc.gov",
    "nih.gov",
    "mohfw.gov.in",
    "health.gov",
    "gov.in",
    "education.gov.in",
    "cbse.gov.in"
];

const BLOCKED_DOMAINS = [
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "pinterest.com"
];

const STOP_WORDS = new Set([
    "about", "after", "again", "against", "also", "among",
    "because", "before", "being", "between", "both", "could",
    "does", "doing", "during", "from", "have", "having",
    "into", "more", "most", "other", "over", "same", "should",
    "some", "such", "than", "that", "their", "them", "there",
    "these", "they", "this", "those", "through", "under",
    "very", "what", "when", "where", "which", "while", "with",
    "would", "your", "today", "latest", "news", "report",
    "reports", "article", "claims", "claim", "says", "said",
    "the", "and", "for", "are", "was", "were", "has", "had",
    "its", "not", "but", "all", "any", "can", "will", "may"
]);

function normalizeText(value = "") {
    return String(value)
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/[^a-z0-9₹%.\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getDomain(url = "") {
    try {
        return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
        return "";
    }
}

function isBlockedDomain(url = "") {
    const domain = getDomain(url);

    return BLOCKED_DOMAINS.some(
        blocked => domain === blocked || domain.endsWith(`.${blocked}`)
    );
}

function getSourcePriority(url = "") {
    const domain = getDomain(url);

    if (
        TRUSTED_DOMAINS.some(
            trusted => domain === trusted || domain.endsWith(`.${trusted}`)
        ) ||
        domain.endsWith(".gov") ||
        domain.endsWith(".gov.in") ||
        domain.endsWith(".nic.in")
    ) {
        return 3;
    }

    return 1;
}

function extractKeywords(text = "") {
    return [
        ...new Set(
            normalizeText(text)
                .split(" ")
                .filter(word =>
                    word.length >= 3 &&
                    !STOP_WORDS.has(word) &&
                    !/^\d+$/.test(word)
                )
        )
    ];
}

function classifyClaim(query = "") {
    const text = normalizeText(query);

    if (
        /\b(diabetes|cancer|disease|cure|cures|medicine|medical|health|symptom|treatment|vaccine|drug|doctor|scientists|clinical|hospital|lemon water)\b/i.test(text)
    ) {
        return "health";
    }

    if (
        /\b(school|schools|holiday|holidays|closed|closure|government announced|government declares|public holiday|nationwide|entire month|education department|cbse)\b/i.test(text)
    ) {
        return "government";
    }

    if (
        /\b(stock market|sensex|nifty|bse|nse|shares|equities|market crash|market crashed|investors|trading)\b/i.test(text)
    ) {
        return "market";
    }

    return "general";
}

// Extract claim-specific concepts that should appear in useful evidence.
function getClaimConcepts(claim, category) {
    const text = normalizeText(claim);
    const concepts = [];

    if (category === "market") {
        if (/\b(crash|crashed|crashes|plunge|plunged|collapse|collapsed)\b/.test(text)) {
            concepts.push(/\b(crash|crashed|crashes|plunge|plunged|collapse|collapsed|sell-off|selloff)\b/);
        }

        if (/\b(sudden economic crisis|economic crisis|financial crisis)\b/.test(text)) {
            concepts.push(/\b(economic crisis|financial crisis|recession|economic shock)\b/);
        }

        if (/\b(sensex|nifty|bse|nse|indian stock market|india)\b/.test(text)) {
            concepts.push(/\b(india|indian|sensex|nifty|bse|nse|dalal street)\b/);
        }
    }

    if (category === "health") {
        if (/\b(lemon water|lemon juice|lemon)\b/.test(text)) {
            concepts.push(/\b(lemon|lemon water|lemon juice)\b/);
        }

        if (/\b(cure|cures|cured|treat|treats|treatment|reverse|reverses)\b/.test(text)) {
            concepts.push(/\b(cure|cures|cured|treat|treats|treatment|reverse|reverses|clinical trial|clinical evidence)\b/);
        }

        if (/\b(diabetes|diabetic|blood sugar)\b/.test(text)) {
            concepts.push(/\b(diabetes|diabetic|blood sugar|glucose)\b/);
        }
    }

    if (category === "government") {
        if (/\b(school|schools)\b/.test(text)) {
            concepts.push(/\b(school|schools|students|academic)\b/);
        }

        if (/\b(nationwide|national|all india|across india)\b/.test(text)) {
            concepts.push(/\b(nationwide|national|all india|across india|across the country|all states)\b/);
        }

        if (/\b(entire month|whole month|month-long|month long|one month)\b/.test(text)) {
            concepts.push(/\b(entire month|whole month|month-long|month long|one month|month of|for a month|month-long closure)\b/);
        }

        if (/\b(announced|announcement|declared|declaration|notice|order)\b/.test(text)) {
            concepts.push(/\b(announced|announcement|declared|declaration|official notice|government order|notification|circular)\b/);
        }
    }

    return concepts;
}

function buildQueries(claim, category) {
    const cleanClaim = String(claim || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 700);

    const queries = [
        `"${cleanClaim}"`,
        `${cleanClaim} fact check`,
        `${cleanClaim} evidence verification`
    ];

    if (category === "market") {
        queries.push(
            `${cleanClaim} India Sensex Nifty date cause`,
            `${cleanClaim} NSE BSE official market data`,
            `${cleanClaim} Reuters India stock market`,
            `${cleanClaim} economic crisis evidence`
        );
    } else if (category === "health") {
        queries.push(
            `${cleanClaim} clinical trial systematic review`,
            `${cleanClaim} WHO NIH medical evidence`,
            `${cleanClaim} diabetes association fact check`,
            `${cleanClaim} peer reviewed research`
        );
    } else if (category === "government") {
        queries.push(
            `${cleanClaim} official government notification`,
            `${cleanClaim} India government fact check`,
            `${cleanClaim} education department official notice`,
            `${cleanClaim} PIB fact check`
        );
    } else {
        queries.push(
            `${cleanClaim} official statement`,
            `${cleanClaim} reputable news fact check`
        );
    }

    return [...new Set(queries)];
}

async function tavilySearch(query, options = {}) {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        throw new Error("TAVILY_API_KEY is missing from the server .env file");
    }

    const body = {
        api_key: apiKey,
        query,
        search_depth: "advanced",
        topic: options.topic || "general",
        max_results: options.maxResults || 8,
        include_answer: false,
        include_raw_content: false
    };

    if (options.days !== undefined) {
        body.days = options.days;
    }

    const response = await fetch(TAVILY_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(
            `Tavily request failed (${response.status}): ${details.slice(0, 300)}`
        );
    }

    const data = await response.json();
    return Array.isArray(data.results) ? data.results : [];
}

function normalizeResult(item, query, claim, category) {
    const title = String(item.title || "").trim();
    const url = String(item.url || "").trim();
    const content = String(item.content || item.raw_content || "").trim();

    const publishedDate =
        item.published_date ||
        item.publishedDate ||
        null;

    const normalizedTitle = normalizeText(title);
    const normalizedContent = normalizeText(content);
    const combinedText = `${normalizedTitle} ${normalizedContent}`;

    const keywords = extractKeywords(claim);
    let matchedTitle = 0;
    let matchedContent = 0;

    for (const word of keywords) {
        if (normalizedTitle.includes(word)) {
            matchedTitle++;
        } else if (normalizedContent.includes(word)) {
            matchedContent++;
        }
    }

    const keywordScore = keywords.length
        ? Math.min(1, (matchedTitle * 3 + matchedContent) / (keywords.length * 3))
        : 0;

    const concepts = getClaimConcepts(claim, category);
    const conceptMatches = concepts.filter(pattern => pattern.test(combinedText)).length;
    const conceptScore = concepts.length ? conceptMatches / concepts.length : 0;

    const sourcePriority = getSourcePriority(url);

    // Relevance is a ranking signal, not proof that the claim is true.
    const relevanceScore = Math.min(
        1,
        keywordScore * 0.45 + conceptScore * 0.55
    );

    return {
        title,
        url,
        content: content.slice(0, 2500),
        publishedDate,
        score: Number(item.score) || 0,
        relevanceScore,
        conceptMatches,
        conceptCount: concepts.length,
        sourcePriority,
        domain: getDomain(url),
        queryUsed: query
    };
}

function hasClaimTopicContext(item, category) {
    const text = normalizeText(`${item.title} ${item.content}`);

    if (category === "market") {
        return (
            /\b(india|indian|sensex|nifty|bse|nse|dalal street)\b/i.test(text) &&
            /\b(stock|market|shares|equity|trading|indices|investors|stocks)\b/i.test(text)
        );
    }

    if (category === "health") {
        return (
            /\b(lemon|diabetes|diabetic|blood sugar|glucose|clinical|medical|health|treatment|cure|research)\b/i.test(text)
        );
    }

    if (category === "government") {
        return (
            /\b(school|schools|holiday|holidays|government|education|announcement|announced|notice|notification|closure|closed|public)\b/i.test(text)
        );
    }

    return true;
}

function isRelevantResult(item, claim, category) {
    if (!item.title || !item.url || !item.content) return false;
    if (isBlockedDomain(item.url)) return false;
    if (!hasClaimTopicContext(item, category)) return false;

    // Reject weak keyword matches, especially results that omit key concepts.
    const minimumConceptMatches =
        item.conceptCount >= 2 ? 1 : 0;

    if (item.conceptMatches < minimumConceptMatches) {
        return false;
    }

    return item.relevanceScore >= 0.16;
}

function deduplicateResults(items) {
    const seen = new Set();
    const output = [];

    for (const item of items) {
        const key = item.url
            .split("#")[0]
            .split("?")[0]
            .replace(/\/+$/, "")
            .toLowerCase();

        if (!key || seen.has(key)) continue;

        seen.add(key);
        output.push(item);
    }

    return output;
}

function sortResults(items) {
    return items.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
        }

        if (b.conceptMatches !== a.conceptMatches) {
            return b.conceptMatches - a.conceptMatches;
        }

        if (b.sourcePriority !== a.sourcePriority) {
            return b.sourcePriority - a.sourcePriority;
        }

        return b.score - a.score;
    });
}

async function runQueries(queries, options, claim, category) {
    const settled = await Promise.allSettled(
        queries.map(query =>
            tavilySearch(query, options).then(results => ({ query, results }))
        )
    );

    const collected = [];

    for (const result of settled) {
        if (result.status !== "fulfilled") continue;

        const { query, results } = result.value;

        for (const item of results) {
            const normalized = normalizeResult(item, query, claim, category);

            if (isRelevantResult(normalized, claim, category)) {
                collected.push(normalized);
            }
        }
    }

    return deduplicateResults(collected);
}

async function searchEvidence(query) {
    const category = classifyClaim(query);
    const queries = buildQueries(query, category);

    const results = await runQueries(
        queries,
        {
            topic: "general",
            maxResults: 8
        },
        query,
        category
    );

    return sortResults(results).slice(0, 8);
}

function isRecentPublication(item, days = 7) {
    if (!item.publishedDate) return false;

    const timestamp = new Date(item.publishedDate).getTime();

    if (!Number.isFinite(timestamp)) return false;

    const age = Date.now() - timestamp;
    const windowMs = days * 24 * 60 * 60 * 1000;

    return age >= 0 && age <= windowMs;
}

async function searchLatestNews(query) {
    const category = classifyClaim(query);
    const queries = buildQueries(query, category).slice(0, 4);

    const results = await runQueries(
        queries,
        {
            topic: "news",
            days: 7,
            maxResults: 8
        },
        query,
        category
    );

    return sortResults(
        results.filter(item => isRecentPublication(item, 7))
    ).slice(0, 5);
}

async function searchRelatedInformation(query) {
    const [evidenceResult, newsResult] = await Promise.allSettled([
        searchEvidence(query),
        searchLatestNews(query)
    ]);

    const sources =
        evidenceResult.status === "fulfilled"
            ? evidenceResult.value
            : [];

    const latestNews =
        newsResult.status === "fulfilled"
            ? newsResult.value
            : [];

    const warnings = [];

    if (evidenceResult.status === "rejected") {
        console.error(
            "Evidence search error:",
            evidenceResult.reason?.message || evidenceResult.reason
        );

        warnings.push("Evidence search was unsuccessful.");
    }

    if (newsResult.status === "rejected") {
        console.error(
            "Latest-news search error:",
            newsResult.reason?.message || newsResult.reason
        );

        warnings.push("Latest-news search was unsuccessful.");
    }

    if (!sources.length) {
        warnings.push(
            "No sufficiently relevant evidence was retrieved. Missing results do not prove the claim false."
        );
    }

    return {
        sources,
        latestNews,
        searchWarning: warnings.length ? warnings.join(" ") : null
    };
}

module.exports = {
    searchEvidence,
    searchLatestNews,
    searchRelatedInformation
};
