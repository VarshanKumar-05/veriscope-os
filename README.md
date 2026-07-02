# 🔭 Veriscope OS — AI Company Intelligence Workspace

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Veriscope OS is a production-grade, evidence-first AI Company Intelligence Workspace. Designed as a professional analyst workbench, it features a multi-agent pipeline that compiles financial records, news sentiment, and competitive metrics for public corporations. It visualizes these findings on an interactive research canvas, offering an explainable and traceable investment rating.

---

## 📖 Table of Contents
* [Overview](#overview)
* [How to Run](#how-to-run)
* [How it Works](#how-it-works)
* [Architecture](#architecture)
* [AI Pipeline](#ai-pipeline)
* [Key Design Decisions](#key-design-decisions)
* [Technology Choices](#technology-choices)
* [Trade-offs & Limitations](#trade-offs--limitations)
* [Docker Instructions](#docker-instructions)
* [Deployment Instructions](#deployment-instructions)
* [Security & Optimizations](#security--optimizations)
* [Folder Structure](#folder-structure)
* [API Specifications](#api-specifications)
* [License](#license)

---

## 🔍 Overview

Veriscope OS is built for retail investors, students, analysts, and researchers performing due diligence. Rather than dumping unstructured chatbot dialogues, Veriscope operates like a professional terminal—visualizing facts as node evidence cards linked directly to conviction metrics. 

---

## 🚀 How to Run

### Prerequisite Check
Ensure you have **Node.js (v20+)** and **npm** installed.

### 1. Offline Sandbox Run (Quick Start)
By default, the application runs in a fully functional local **Demo Sandbox Mode** with zero API keys required.
```bash
# 1. Clone the repository
git clone https://github.com/your-username/veriscope-os.git
cd veriscope-os

# 2. Duplicate env config
cp .env.example .env

# 3. Boot dev servers concurrently
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Live AI Connect Mode
To run live searches for any public company:
1. Open the `.env` file in the root folder.
2. Provide your API keys:
   ```bash
   GEMINI_API_KEY=your_google_gemini_key_here
   NEWS_API_KEY=your_news_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   ```
3. Restart the dev environment: `npm run dev`.

---

## 🛠️ How it Works

1. **Query Entry**: Users input a company ticker (e.g. `AAPL`) or general company name (e.g. `Microsoft`).
2. **Auto-Normalizer**: An intelligent router maps keywords to valid tickers.
3. **Evidence Harvesting**: Specialized agents scrape financials, media channels, and peer indicators.
4. **Adversarial Critique**: A dedicated risk evaluator searches for supply chain bottlenecks and margin compression risks.
5. **Rating Assessment**: The recommendation engine synthesizes evidence, assigning confidence scores.
6. **Canvas Layout**: Claims populate React Flow nodes linked dynamically by edge flows corresponding to category types.

---

## 🏗️ Architecture

Veriscope OS separates visual presentation layers from agent graph layers:
* **Frontend Client**: Multi-tab workspace detailing conviction matrices, financial margins, chart histories (Recharts), news pie distributions, and competitive spreadsheets.
* **Backend Coordinator**: Executes graph workflows using **LangGraph** concepts.
* **Shared Schemas**: A central interface definition guarantees typescript validation across both spaces.

Detailed architectural charts are available in [Architecture.md](file:///d:/placements/insideLLM/docs/Architecture.md).

---

## 🤖 AI Pipeline

```text
[Planner Agent] ──> [Financial Agent] (Balance sheets, margins)
                 ──> [News Agent] (Media sentiment indices)
                 ──> [Competitor Agent] (Multiple valuation maps)
                 ──> [Adversarial Risk Agent] (Vulnerabilities, headwinds)
                       │
                       └──> [Recommendation Synthesizer] ──> [Focal Decision Card]
```

* **Live Mode**: Google Gemini or OpenAI GPT models query APIs in a structured state machine.
* **Sandbox Mode**: Implements a JavaScript `Proxy` that generates stable, character-seeded mock outputs for **any arbitrary company stock**, ensuring offline capability.

---

## 🎯 Key Design Decisions

* **Evidence-First UI**: Bypassed conversational text feeds. Every claim is mapped to a clickable node detailing its source and confidence score.
* **Aurora Blueprint Theme**: Tailored a minimalist, contrast-rich grid system using global design variable tokens.
* **State Graph Persistence**: Research histories are saved to local log files, preventing data loss during node rebuilds.

---

## 💻 Technology Choices

* **Why React**: Single-page application renders, quick states transitions, and clean Component models.
* **Why Express**: Lightweight Node.js server optimal for serving compiled static files.
* **Why Docker**: Containerized multi-stage pipelines guarantee consistency across staging and production.
* **Why React Flow**: Best-in-class canvas visualizer for interactive edge maps and custom nodes.

---

## ⚖️ Trade-offs & Limitations

* **Synchronous Build Wait**: Compiling multi-source live API calls requires ~10-15 seconds. (Mitigated using real-time log loaders).
* **Vite Environment Compiling**: Vite variables are baked in at build time, requiring frontend rebuilds when changing backend URLs.

---

## 🐳 Docker Instructions

Build and boot the services in containerized isolation:
```bash
# Compile and boot all services
docker compose up --build

# Stop the services
docker compose down -v
```
Exposed ports:
* Frontend Client: [http://localhost:5173](http://localhost:5173)
* Backend Server: [http://localhost:5000/health](http://localhost:5000/health)

Detailed Docker structures are described in [Docker.md](file:///d:/placements/insideLLM/docs/Docker.md).

---

## 📦 Deployment Instructions

### Render (Backend & Client Hosting)
Deploy our multi-stage unified [Dockerfile](file:///d:/placements/insideLLM/Dockerfile):
1. Create a **Web Service** on Render pointing to your repo.
2. Select runtime **Docker**.
3. Set environment variable `NODE_ENV=production`.

### Vercel (Frontend Static Hosting)
1. Import the `./client` subdirectory.
2. Select **Vite** preset.
3. Configure the build-time env variable `VITE_API_URL` to point to your backend Render instance.

Detailed guidelines are compiled in [Deployment.md](file:///d:/placements/insideLLM/docs/Deployment.md).

---

## 🔒 Security & Optimizations

* **Secret Isolation**: All credentials run server-side and are never compiled into client bundles.
* **CORS Safe-Listing**: Configured environment-driven origins limits.
* **Static Assets Caching**: Nginx serves index folders with compressed asset packaging.

---

## 📂 Folder Structure

The directory organization is documented in [FolderStructure.md](file:///d:/placements/insideLLM/docs/FolderStructure.md).

---

## 📡 API Specifications

Complete route details and payload shapes are documented in [API.md](file:///d:/placements/insideLLM/docs/API.md).

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## ✍️ Author
Developed by the Veriscope OS Project Maintainers. Submitted for the AI Engineering Major Project Requirement.
