# Veriscope OS — Deployment Guide

This guide details instructions to deploy Veriscope OS to production hosting providers like **Vercel** and **Render**.

---

## 1. Unified Single-Container Deployment (Render)

Render supports deploying our multi-stage root `Dockerfile` which bundles both frontend static files and the backend Express server into a single container.

### Step-by-Step Render Setup:
1. Create a new **Web Service** on Render and connect your GitHub repository.
2. Select **Docker** as the runtime.
3. Configure the following **Environment Variables**:
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `GEMINI_API_KEY`: *(Optional)* Your Gemini Live key. If left blank, Sandbox Mode runs.
   * `NEWS_API_KEY`: *(Optional)* Your News API key.
   * `TAVILY_API_KEY`: *(Optional)* Your Tavily search key.
   * `CORS_ORIGIN`: Your frontend URL (e.g. `https://veriscope-client.vercel.app` or `*`).
4. Click **Deploy Web Service**. Render will automatically build the multi-stage Docker image and expose the unified health-checked backend.

---

## 2. Decoupled Frontend Deployment (Vercel)

Vercel is optimal for hosting the React client as a fast static-asset site.

### Step-by-Step Vercel Setup:
1. Create a new project on Vercel and import your repository.
2. Configure Vercel to build from the `./client` subdirectory:
   * **Root Directory**: `client`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Configure the **Build Environment Variables**:
   * `VITE_API_URL`: Your Render backend URL (e.g., `https://veriscope-backend.onrender.com`). Do not append `/api` as the API path helper is resolved automatically.
4. Click **Deploy**. Vercel will bundle the static React app and route backend queries to your Render web service.
