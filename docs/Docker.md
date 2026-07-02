# Veriscope OS — Docker Integration

This document outlines how to build, run, and scale Veriscope OS using Docker and Docker Compose.

---

## 1. Local Orchestration (Docker Compose)

The project includes a root `docker-compose.yml` file configuring two local services:

* **veriscope-backend**: Compiles typescript code and runs the Express API on port `5000`. Exposes a healthcheck endpoint at `http://localhost:5000/health`.
* **veriscope-frontend**: Serves compiled Vite React static assets via Nginx on port `5173`. Incorporates a healthcheck testing server availability.

### How to Run Locally:
```bash
# Build and startup the container grid
docker compose up --build

# Shutdown the container grid and remove volumes
docker compose down -v
```

---

## 2. Dockerfile Multi-Stage Architectures

### Backend Dockerfile (`server/Dockerfile`)
1. **Stage 1 (Builder)**: Copy package files, `tsconfig.json`, and the root `shared/` directory. Install compile dependencies and execute `npm run build`.
2. **Stage 2 (Runner)**: Copy compiled JS files, install only production-only dependencies (`npm ci --omit=dev`), set port parameters, configure a container healthcheck (`wget`), and expose port `5000`.

### Frontend Dockerfile (`client/Dockerfile`)
1. **Stage 1 (Builder)**: Install client dependencies, import source modules, bind Vite build variables, and compile the bundle (`npm run build`).
2. **Stage 2 (Runner)**: Pull the alpine Nginx base, copy built static assets into `/usr/share/nginx/html`, overwrite custom routing defaults (`nginx.conf`), configure web healthchecks, and expose port `80`.
