import { useState } from "react";
import "./App.css";

function App() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState(null);

    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);


    // ==========================================
    // SUBMIT NEWS FOR ANALYSIS
    // ==========================================

    const submitNews = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setMessage(
                "Please enter both a headline and news content."
            );

            setResult(null);
            return;
        }

        setLoading(true);
        setMessage("");
        setResult(null);

        try {
            const response = await fetch(
  "https://mindcheck-o280.onrender.com/api/news",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        title: title.trim(),
                        content: content.trim(),
                    }),
                }
            );

            const data = await response.json();

            console.log(
                "BACKEND RESPONSE:",
                data
            );

            if (response.ok) {

                setMessage(
                    "✓ News analyzed and saved successfully!"
                );

              
const analysisResult = data.result || data.news;

console.log("AI RESULT RECEIVED:", analysisResult);
console.log("SOURCES RECEIVED:", analysisResult?.sources);

setResult({
    prediction: analysisResult.prediction,
    confidence: analysisResult.confidence,
    analysis: analysisResult.analysis,
    wordCount: analysisResult.wordCount || 0,
    keyClaims: analysisResult.keyClaims || [],
    recommendation: analysisResult.recommendation || "",
    sources: Array.isArray(analysisResult.sources)
        ? analysisResult.sources
        : [],
    latestNews: Array.isArray(analysisResult.latestNews)
        ? analysisResult.latestNews
        : [],
    searchWarning: analysisResult.searchWarning || null
});

setTitle("");
setContent("");


            } else {

                setMessage(
                    data.message ||
                    "Something went wrong."
                );
            }

        } catch (error) {

            console.error(
                "Frontend error:",
                error
            );

            setMessage(
                "Unable to connect to the backend. Make sure the server is running."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // FETCH HISTORY FROM MONGODB
    // ==========================================

    
const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
        const response = await fetch(
            "https://mindcheck-o280.onrender.com/api/news"
        );

        const data = await response.json();

        console.log("HISTORY RESPONSE:", data);
        console.log("HISTORY RECORDS:", data.news);

        if (response.ok) {
            const records = data.news || [];

            setHistory(records);
            setShowHistory(true);

            // Scroll to history section
            setTimeout(() => {
                document
                    .getElementById("history")
                    ?.scrollIntoView({
                        behavior: "smooth",
                    });
            }, 100);
        } else {
            console.error("History API error:", data.message);

            setMessage(
                data.message || "Unable to load history."
            );
        }
    } catch (error) {
        console.error("History error:", error);

        setMessage(
            "Unable to connect to the history API."
        );
    } finally {
        setHistoryLoading(false);
    }
};


    // ==========================================
    // SCROLL TO ANALYZER
    // ==========================================

    const scrollToAnalyzer = () => {

        document
            .getElementById("analyzer")
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };


    // ==========================================
    // JSX
    // ==========================================

    return (
        <div className="app">


            {/* ==========================================
                NAVBAR
            ========================================== */}

            <nav className="navbar">

                <div className="logo">

                    <span className="logo-mark">
                        ✦
                    </span>

                    <span>
                        MIND
                        <span className="logo-accent">
                            CHECK
                        </span>
                    </span>

                </div>


                <div className="nav-links">

                    <a href="#home">
                        Home
                    </a>

                    <a href="#analyzer">
                        Detect
                    </a>

                    <a href="#how-it-works">
                        How It Works
                    </a>

                    <a href="#features">
                        Features
                    </a>


                    <button
                        className="history-nav-button"
                        onClick={fetchHistory}
                    >
                        History
                    </button>

                </div>


                <button
                    className="nav-button"
                    onClick={scrollToAnalyzer}
                >
                    Analyze News →
                </button>

            </nav>


            {/* ==========================================
                HERO
            ========================================== */}

            <section
                className="hero"
                id="home"
            >

                <div className="hero-glow glow-one"></div>

                <div className="hero-glow glow-two"></div>


                <div className="hero-content">

                    <div className="eyebrow">

                        <span className="status-dot"></span>

                        AI-POWERED CREDIBILITY ANALYSIS

                    </div>


                    <h1>
                        Don't just read.
                        <br />
                        <span>
                            Verify.
                        </span>
                    </h1>


                    <p className="hero-description">

                        Analyze news content using AI and retrieved evidence to assess potentially misleading information and understand the signals behind the result.

                    </p>


                    <div className="hero-actions">

                        <button
                            className="primary-button"
                            onClick={scrollToAnalyzer}
                        >
                            Analyze a News Article
                            <span>↗</span>
                        </button>


                        <a
                            href="#how-it-works"
                            className="secondary-button"
                        >
                            Explore how it works ↓
                        </a>

                    </div>


                    <div className="hero-stats">

                        <div>
                            <strong>
                                01
                            </strong>

                            <span>
                                AI Analysis
                            </span>
                        </div>


                        <div>
                            <strong>
                                02
                            </strong>

                            <span>
                                Risk Assessment
                            </span>
                        </div>


                        <div>
                            <strong>
                                03
                            </strong>

                            <span>
                                Clear Explanation
                            </span>
                        </div>

                    </div>

                </div>


                <div className="hero-visual">

                    <div className="floating-card card-one">

                        <span className="card-icon">
                            ◈
                        </span>

                        <div>

                            <small>
                                CONTENT SIGNAL
                            </small>

                            <strong>
                                Analyzing...
                            </strong>

                        </div>

                    </div>


                    <div className="scan-circle">

                        <div className="circle-inner">

                            <span>
                                AI
                            </span>

                            <small>
                                ANALYSIS
                            </small>

                        </div>

                    </div>


                    <div className="floating-card card-two">

                        <span className="score-icon">
                            ✓
                        </span>

                        <div>

                            <small>
                                RESULT
                            </small>

                            <strong>
                                Assessment Ready
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                ANALYZER
            ========================================== */}

            <section
                className="analyzer-section"
                id="analyzer"
            >

                <div className="section-heading">

                    <span className="section-label">
                        DETECT
                    </span>


                    <h2>
                        Put the news
                        <br />
                        <span>
                            under the lens.
                        </span>
                    </h2>


                    <p>

                        Paste a headline and article content
                        below. Our system will process the
                        information and generate a credibility
                        assessment.

                    </p>

                </div>


                <div className="analyzer-box">

                    <form
                        onSubmit={submitNews}
                    >

                        <div className="input-group">

                            <label>
                                NEWS HEADLINE
                            </label>


                            <input
                                type="text"
                                placeholder="Enter the news headline..."
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="input-group">

                            <label>
                                NEWS CONTENT
                            </label>


                            <textarea
                                placeholder="Paste the complete news article or content here..."
                                value={content}
                                onChange={(e) =>
                                    setContent(
                                        e.target.value
                                    )
                                }
                                rows="10"
                            />

                        </div>


                        <div className="form-bottom">

                            <span className="privacy-note">
                                ✦ Your content is processed for analysis
                            </span>


                            <button
                                type="submit"
                                className="analyze-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Analyzing..."
                                    : "Analyze Content →"}

                            </button>

                        </div>

                    </form>


                    {/* MESSAGE */}

                    {message && (

                        <div className="message">

                            {message}

                        </div>

                    )}


                    {/* ==========================================
                        ANALYSIS RESULT
                    ========================================== */}

                    {result && (

                        <div className="result-card">


                            <div className="result-header">

                                <span className="section-label">
                                    ANALYSIS RESULT
                                </span>


                                <span className="result-status">
                                    AI ANALYSIS
                                </span>

                            </div>


                            <div className="result-main">


                                <div className="prediction-box">

                                    <small>
                                        PREDICTION
                                    </small>


                                    <h3>
                                        {result.prediction}
                                    </h3>

                                </div>


                                <div className="confidence-box">

                                    <small>
                                        ESTIMATED CONFIDENCE
                                    </small>


                                    <div className="confidence-value">
                                        {result.confidence}%
                                    </div>

                                </div>

                            </div>


                            <div className="analysis-box">

                                <small>
                                    ANALYSIS
                                </small>


                                <p>
                                    {result.analysis}
                                </p>

                            </div>
                            
{result.sources && result.sources.length > 0 && (
    <div className="analysis-box sources-box">
        <small>EXTERNAL SOURCES</small>

        <p>
            Sources retrieved for this assessment.
            They are references to investigate, not proof by themselves.
        </p>

        <ul className="source-list">
            {result.sources.map((source, index) => (
                <li key={source.url || index}>
                    <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {source.title || `Source ${index + 1}`}
                    </a>

                    <p>{source.content}</p>
                </li>
            ))}
        </ul>
    </div>
)}

                            {/* LATEST RELATED NEWS */}
                            <div className="analysis-box latest-news-box">
                                <small>LATEST RELATED NEWS</small>

                                <p>
                                    Recent articles related to the submitted claim.
                                    Review the original sources before drawing conclusions.
                                </p>

                                {result.latestNews && result.latestNews.length > 0 ? (
                                    <ul className="source-list">
                                        {result.latestNews.map((item, index) => (
                                            <li key={item.url || index}>
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {item.title || `News article ${index + 1}`}
                                                </a>

                                                <p className="latest-news-date">
                                                    Published:{" "}
                                                    {item.publishedDate &&
                                                    !Number.isNaN(new Date(item.publishedDate).getTime())
                                                        ? new Date(item.publishedDate).toLocaleString()
                                                        : "Publication date unavailable"}
                                                </p>

                                                {item.content && (
                                                    <p>
                                                        {item.content.length > 350
                                                            ? `${item.content.slice(0, 350)}...`
                                                            : item.content}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>
                                        No recent related articles with usable publication dates
                                        were found. This does not necessarily mean that no recent
                                        coverage exists.
                                    </p>
                                )}
                            </div>

                            {result.searchWarning && (
                                <p className="message">
                                    {result.searchWarning}
                                </p>
                            )}




                            <div className="result-footer">

                                <span>
                                    Words analyzed:{" "}
                                    {result.wordCount}
                                </span>


                                <span>
                                    Preliminary assessment
                                </span>

                            </div>

                        </div>

                    )}

                </div>

            </section>


            {/* ==========================================
                HISTORY
            ========================================== */}

            {showHistory && (

                <section
                    className="history-section"
                    id="history"
                >

                    <div className="history-heading">

                        <span className="section-label">
                            HISTORY
                        </span>


                        <h2>
                            Your analysis
                            <br />
                            <span>
                                history.
                            </span>
                        </h2>


                        <p>
                            Previously analyzed news articles
                            and their credibility assessments.
                        </p>

                    </div>


                    {/* LOADING */}

                    {historyLoading ? (

                        <div className="history-loading">

                            Loading analysis history...

                        </div>


                    ) : history.length === 0 ? (

                        /* EMPTY HISTORY */

                        <div className="history-empty">

                            <h3>
                                No analysis history yet.
                            </h3>

                            <p>
                                Analyze your first news article
                                to see it here.
                            </p>

                        </div>


                    ) : (

                        /* HISTORY RECORDS */

                        <div className="history-list">

                            {history.map((item) => (

                                <div
                                    className="history-card"
                                    key={item._id}
                                >


                                    <div className="history-card-top">

                                        <div>

                                            <span className="history-label">
                                                NEWS
                                            </span>


                                            <h3>
                                                {item.title}
                                            </h3>

                                        </div>


                                        <span className="history-prediction">
                                            {item.prediction}
                                        </span>

                                    </div>


                                    <p className="history-content">
                                        {item.content}
                                    </p>


                                    <div className="history-details">

                                        <span>
                                            Confidence:{" "}

                                            <strong>
                                                {item.confidence}%
                                            </strong>
                                        </span>


                                        <span>

                                            {item.createdAt
                                                ? new Date(
                                                    item.createdAt
                                                ).toLocaleString()
                                                : "Date unavailable"}

                                        </span>

                                    </div>


                                    <div className="history-analysis">

                                        <small>
                                            ANALYSIS
                                        </small>


                                        <p>
                                            {item.analysis ||
                                                "No analysis available."}
                                        </p>

                                    </div>
                                    
{Array.isArray(item.sources) && item.sources.length > 0 && (
    <div className="history-analysis history-sources">
        <small>EXTERNAL SOURCES</small>

        <p>
            Sources retrieved for this assessment.
            They are references to investigate, not proof by themselves.
        </p>

        <ul className="source-list">
            {item.sources.map((source, index) => (
                <li key={source.url || index}>
                    <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {source.title || `Source ${index + 1}`}
                    </a>

                    {source.content && (
                        <p>{source.content}</p>
                    )}
                </li>
            ))}
        </ul>
    </div>
)}


                                </div>

                            ))}

                        </div>

                    )}

                </section>

            )}


            {/* ==========================================
                HOW IT WORKS
            ========================================== */}

            <section
                className="process-section"
                id="how-it-works"
            >

                <div className="process-title">

                    <span className="section-label">
                        PROCESS
                    </span>


                    <h2>
                        From headline
                        <br />
                        to <span>insight.</span>
                    </h2>

                </div>


                <div className="process-grid workflow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>

                    <div className="process-card">
                        <span className="number">01</span>
                        <div className="process-icon">↳</div>
                        <h3>Enter News</h3>
                        <p>Submit the news headline and article content you want MindCheck to examine.</p>
                    </div>


                    <div className="process-card">
                        <span className="number">02</span>
                        <div className="process-icon">⌘</div>
                        <h3>Backend Processing</h3>
                        <p>The Express server validates the submitted headline and content and starts the analysis workflow.</p>
                    </div>


                    <div className="process-card">
                        <span className="number">03</span>
                        <div className="process-icon">⌕</div>
                        <h3>Evidence Retrieval</h3>
                        <p>Tavily searches for related external sources and recent news that may help assess the claim.</p>
                    </div>


                    <div className="process-card">
                        <span className="number">04</span>
                        <div className="process-icon">✦</div>
                        <h3>AI Analysis</h3>
                        <p>The AI examines the submitted content alongside available evidence and identifies key claims and uncertainties.</p>
                    </div>


                    <div className="process-card">
                        <span className="number">05</span>
                        <div className="process-icon">◉</div>
                        <h3>Risk Assessment</h3>
                        <p>View the prediction, estimated confidence score, explanation, key claims, and verification recommendation.</p>
                    </div>


                    <div className="process-card">
                        <span className="number">06</span>
                        <div className="process-icon">▤</div>
                        <h3>Save to MongoDB</h3>
                        <p>The article, assessment, and retrieved evidence are stored in the database for future reference.</p>
                    </div>


                    <div className="process-card">
                        <span className="number">07</span>
                        <div className="process-icon">↗</div>
                        <h3>Analysis History</h3>
                        <p>Open History to revisit previously analyzed articles and review their saved assessments and sources.</p>
                    </div>

                </div>
            </section>


            {/* ==========================================
                FEATURES
            ========================================== */}

            <section
                className="features-section"
                id="features"
            >

                <div className="features-heading">

                    <span className="section-label">
                        FEATURES
                    </span>


                    <h2>
                        Four ways
                        <br />
                        <span>
                            we analyze.
                        </span>
                    </h2>


                    <p>

                        A simple interface backed by AI-powered analysis, external evidence retrieval, and persistent analysis history.

                    </p>

                </div>


                <div className="feature-list">


                    <div className="feature-item">

                        <div className="feature-number">
                            01
                        </div>


                        <div className="feature-icon">
                            AI
                        </div>


                        <div>

                            <h3>
                                AI Analysis
                            </h3>


                            <p>

                                Examine submitted news content alongside retrieved evidence to identify claims and uncertainties.

                            </p>

                        </div>


                        <span className="feature-arrow">
                            ↗
                        </span>

                    </div>


                    <div className="feature-item">

                        <div className="feature-number">
                            02
                        </div>


                        <div className="feature-icon">
                            ◈
                        </div>


                        <div>

                            <h3>
                                Risk Assessment
                            </h3>


                            <p>

                                Generate an understandable
                                assessment of potential
                                misinformation risk.

                            </p>

                        </div>


                        <span className="feature-arrow">
                            ↗
                        </span>

                    </div>


                    <div className="feature-item">

                        <div className="feature-number">
                            03
                        </div>


                        <div className="feature-icon">
                            %
                        </div>


                        <div>

                            <h3>
                                Confidence Score
                            </h3>


                            <p>

                                Present the model's estimated
                                confidence in a simple and
                                readable format.

                            </p>

                        </div>


                        <span className="feature-arrow">
                            ↗
                        </span>

                    </div>


                    <div className="feature-item">

                        <div className="feature-number">
                            04
                        </div>


                        <div className="feature-icon">
                            ↗
                        </div>


                        <div>

                            <h3>
                                Analysis History
                            </h3>


                            <p>

                                Store submitted news and
                                analysis results for future
                                reference.

                            </p>

                        </div>


                        <span className="feature-arrow">
                            ↗
                        </span>

                    </div>

                </div>

            </section>


            {/* ==========================================
                CTA
            ========================================== */}

            <section className="cta-section">

                <div className="cta-glow"></div>


                <span className="section-label">
                    START CHECKING
                </span>


                <h2>

                    Question the story.
                    <br />

                    <span>
                        Understand the signal.
                    </span>

                </h2>


                <button
                    className="primary-button large"
                    onClick={scrollToAnalyzer}
                >
                    Analyze News →
                </button>

            </section>


            {/* ==========================================
                FOOTER
            ========================================== */}

            <footer>

                <div className="footer-logo">

                    ✦ MIND
                    <span>
                        CHECK
                    </span>

                </div>


                <p>
                    Misinformation Detection System
                </p>


                <span>
                    Built with React · Node.js · MongoDB
                </span>

            </footer>

        </div>
    );
}

export default App;