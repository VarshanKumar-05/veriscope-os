# Veriscope OS 🔭

![Veriscope OS](docs/screenshot.png) *(Note: Please place your application screenshot in `docs/screenshot.png`)*

## 1. Project Overview

**Veriscope OS** is a cutting-edge, AI-powered investment research workspace designed to analyze publicly traded companies worldwide. Built for the InsideLLM AI Investment Research Agent Assignment, Veriscope transcends traditional chatbot interfaces by offering a fully immersive, institutional-grade research platform.

Rather than relying on hallucination-prone text generation, Veriscope acts as an autonomous financial analyst. It orchestrates a complex pipeline that ingests data from multiple verified financial sources, cross-references corporate metadata, and deploys specialized AI reasoning agents to synthesize financial health, market risks, and peer landscapes. The final output is structured as a stunning, interactive Research Canvas that visualizes the AI's investigation process and concludes with a definitive, confidence-scored investment recommendation.

### The Research Workflow:
1. **Search & Discovery**: Enter a Company Name, Ticker Symbol, or ISIN.
2. **Data Aggregation**: The system silently fetches real-time quotes, company profiles, and global news.
3. **AI Verification**: The Data Verification Agent cross-checks facts to eliminate hallucinations.
4. **Agentic Reasoning**: Specialized agents (Financial, Risk, Competitor, News) process the raw data.
5. **Synthesis**: The Decision Maker Agent formulates a final Buy/Hold/Sell rating with a Conviction Score.
6. **Visualization**: The results are presented in a dynamic, interactive Research Canvas.

---

## 2. Features

Veriscope OS is packed with professional-grade features:

- **Worldwide Public Company Research**: Search and analyze any globally listed public company.
- **Intelligent Search**: Find companies using their Official Legal Name, partial name, Ticker Symbol, or ISIN.
- **Executive Summary**: Get a quick, AI-generated snapshot of the company's business model and leadership.
- **Research Canvas**: A beautiful, interactive node-based graph (powered by React Flow) that maps out the AI's logic, complete with glowing neural-network connection wires and interactive evidence cards.
- **Financial Analytics**: Deep dive into 18+ verified financial metrics (EBITDA, ROA, ROE, Margins) complete with data visualizations.
- **News Sentiment**: Real-time analysis of the latest global news headlines, categorizing sentiment as positive, neutral, or negative.
- **Peer Landscape**: AI-identified competitors with direct strength/weakness comparisons.
- **Risk Heatmap**: A categorized breakdown of regulatory, economic, and technological risks with severity scoring.
- **AI Investment Recommendation**: A definitive Buy, Hold, or Sell rating.
- **Confidence Score**: A transparent conviction index (0-100%) indicating the AI's certainty based on data availability and consistency.
- **Evidence Verification**: Strict anti-hallucination protocols that flag unavailable data instead of guessing.
- **Watchlist**: Pin your favorite research reports to the sidebar for quick access.
- **Export Professional PDF Report**: Generate clean, print-ready PDF tearsheets of your research.
- **Dark Mode / Light Mode**: Beautiful UI tailored to your preferences, featuring an "AI Blueprint" aesthetic in dark mode.
- **Responsive Design**: Flawlessly adapts to desktops, tablets, and modern web environments.

---

## 3. Technology Stack

**Frontend**
- React
- TypeScript
- Tailwind CSS
- React Flow (for the Research Canvas)
- Recharts (for Financial Data Visualization)

**Backend**
- Node.js
- Express
- TypeScript

**Artificial Intelligence**
- Google Gemini (gemini-3.1-flash-lite via official SDK)
- Structured AI Reasoning & Agentic Pipelines

**Financial Data APIs**
- Yahoo Finance (via `yahoo-finance2`)
- Finnhub
- Alpha Vantage
- Polygon.io

**Search & News**
- Tavily Search API
- NewsAPI (with robust RSS Fallbacks)

**Deployment**
- Docker
- Render

---

## 4. Architecture

Veriscope OS employs a multi-stage, agentic pipeline:

```text
User Input (Name, Ticker, ISIN)
       ↓
Company Resolver (Maps input to canonical ticker via Yahoo Finance/Search)
       ↓
Ticker Verification (Ensures the asset is a valid, publicly traded equity)
       ↓
Financial Data Collection (Parallel fetching from Yahoo, Finnhub, etc.)
       ↓
News Collection (NewsAPI / Google News RSS)
       ↓
AI Research Engine (Parallel execution of specialized LLM Agents)
       ↓
Evidence Verification (Cross-referencing to eliminate hallucinations)
       ↓
Executive Summary Generation
       ↓
Research Canvas Rendering (Interactive React Flow Graph)
       ↓
Financial Analytics Processing (Data formatting and Charting)
       ↓
Final Investment Recommendation & Conviction Scoring
       ↓
Professional PDF Export
```

---

## 5. Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/VarshanKumar-05/veriscope-os.git
   cd veriscope-os
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```
   *(Or manually run `npm install` in the root, `client`, and `server` directories).*

3. **Configure environment variables**
   Copy the example environment file and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

4. **Run the Backend (Development)**
   ```bash
   npm run dev:server
   ```

5. **Run the Frontend (Development)**
   ```bash
   npm run dev:client
   ```
   *(Or run both simultaneously from the root using `npm run dev` if configured).*

### Docker Instructions
If you prefer running the application in a containerized environment:
```bash
docker-compose up --build
```
This will spin up both the frontend and backend services automatically.

---

## 6. Environment Variables

To fully utilize the platform, configure the following variables in your `.env` file:

- `GEMINI_API_KEY`: **(Required)** Used to power the core AI reasoning, Data Verification, News Sentiment, Risk Analysis, and Decision Making agents.
- `TAVILY_API_KEY`: *(Optional)* Used for advanced web search fallback when standard financial APIs lack specific corporate context.
- `NEWS_API_KEY`: *(Optional)* Used to fetch the latest global news articles for the News Sentiment agent. (Falls back to Google News RSS if missing).
- `FINNHUB_API_KEY`: *(Optional)* Used to fetch institutional-grade corporate profiles and verify exact legal company names.
- `ALPHA_VANTAGE_API_KEY`: *(Optional)* Used as a secondary source for financial metrics and historical data.
- `POLYGON_API_KEY`: *(Optional)* Used for real-time market data and ticker resolution.

*Note: The system is designed to gracefully degrade. If premium financial APIs are missing, it falls back to free providers (like Yahoo Finance) and RSS feeds.*

---

## 7. API Integrations

- **Google Gemini**: The brain of the operation. Parses raw JSON data from financial APIs and returns structured TypeScript interfaces (`JSON`) containing risk assessments, sentiment analysis, and investment ratings.
- **Yahoo Finance**: The primary workhorse for real-time stock quotes, basic company profiles, and market overview data.
- **Finnhub**: Used as a secondary verification layer to confirm official legal company names, industry classifications, and headquarters locations.
- **Google News RSS**: Provides a free, highly reliable stream of recent news articles for the Sentiment Agent to analyze when premium news APIs are unavailable.

---

## 8. Design Decisions

- **Why React Flow was chosen**: Standard dashboards with stacked cards are boring. React Flow allows us to visually demonstrate the AI's "thought process" using nodes and connecting wires, giving users a tangible sense of how the evidence leads to the final recommendation.
- **Why Gemini was selected**: Gemini offers incredible speed (Flash Lite), large context windows, and highly reliable structured JSON output, which is strictly required for programmatic rendering of the React Flow canvas.
- **Why multiple financial APIs are combined**: Financial data is famously fragmented. By combining Yahoo Finance and Finnhub, we achieve global coverage and cross-reference data points to ensure accuracy.
- **Why evidence verification is used**: LLMs are prone to hallucinations, especially with numbers. Our Data Verification Agent acts as a strict firewall—if a metric isn't found in the raw API payloads, the AI is instructed to return "Verified information unavailable" rather than guessing.
- **Why confidence scoring exists**: Financial markets are probabilistic. The Conviction Index provides transparency, letting the user know how much faith the AI places in its own recommendation based on data quality and market volatility.

---

## 9. Trade-offs

- **Free API Rate Limits**: The platform relies heavily on free tiers of financial APIs (like Yahoo Finance). During heavy usage, rate limits (`429 Too Many Requests`) may occasionally cause data retrieval to fail or fall back to cached data.
- **Private Company Information**: The system is exclusively built for publicly traded equities. It cannot analyze private companies, startups, or assets without a public ticker.
- **Market Data Latency**: Data is slightly delayed (typically 15 minutes) as per standard free API tier restrictions, making this unsuitable for high-frequency day trading.
- **Fallback Mechanisms**: If the LLM fails to parse its own JSON or an API goes down, the system uses mock data or cached history to ensure the UI doesn't crash, trading real-time accuracy for application stability.

---

## 10. Example Companies

Try searching for these companies to see Veriscope OS in action:

- **NVIDIA** (High growth, AI sector dynamics)
- **Apple** (Stable blue-chip, massive revenue)
- **IBM** (Legacy tech, dividend focus)
- **Microsoft** (Cloud dominance)
- **Alphabet** (Search and advertising metrics)
- **Tesla** (High volatility, sentiment-driven)
- **Tech Mahindra** (Indian IT sector)
- **TCS** (Tata Consultancy Services)
- **Reliance Industries** (Conglomerate analysis)
- **JPMorgan Chase** (Financial sector metrics)

---

## 11. Future Improvements

While Veriscope OS is highly capable, the roadmap includes:

- **SEC Filing Analysis**: Direct ingestion and semantic search of 10-K and 10-Q filings.
- **Portfolio Optimizer**: Analyzing correlation and risk across a basket of generated reports.
- **Monte Carlo Simulation**: Probability modeling for future price action.
- **DCF Valuation**: Automated Discounted Cash Flow models based on analyst growth estimates.
- **Institutional Ownership**: Tracking hedge fund and insider buying/selling trends.
- **Insider Transactions**: Real-time alerts on C-suite stock sales.
- **Economic Indicators**: Correlating company performance with macro data (CPI, Interest Rates).
- **AI Portfolio Assistant**: A conversational chat interface to query your saved research reports.
- **Historical Timeline**: Visualizing company milestones and historical ratings over time.
- **Multi-Agent Debate**: Spawning multiple AI agents with different investment philosophies (e.g., Value vs. Growth) to debate the stock before issuing a final recommendation.

---

## 12. Folder Structure

- `/client`: Contains the React/Vite frontend application.
  - `/src/pages`: Main views (`LandingPage.tsx`, `Dashboard.tsx`).
  - `/src/layout`: Shell components (`Layout.tsx`, navigation, sidebar).
  - `/src/components`: Reusable UI components (Charts, Nodes).
- `/server`: Contains the Node.js/Express backend API.
  - `/routes`: Express API endpoints (`/api/research`, `/api/market-overview`).
  - `/services`: Core business logic (`llm.ts`, `yfinance.ts`, `discovery.ts`).
  - `/graph`: The LangGraph/StateGraph execution engine coordinating the AI agents.
- `/shared`: Contains shared TypeScript interfaces used by both the frontend and backend to ensure type safety.
- `/docs`: Contains screenshots, diagrams, and project documentation assets.

---

## 13. License

This project is licensed under the MIT License - see the LICENSE file for details.
