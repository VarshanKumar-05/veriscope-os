  # Stage 1: Build React Client
  FROM node:20-alpine AS client-builder
  WORKDIR /app/client
  COPY client/package*.json ./
  RUN npm install --legacy-peer-deps
  COPY client/ ./
  # Inject production backend target URL at build time
  ARG VITE_API_URL
  ENV VITE_API_URL=${VITE_API_URL}
  RUN npm run build

  # Stage 2: Build Express Server
  FROM node:20-alpine AS server-builder
  WORKDIR /app
  COPY server/package*.json ./server/
  COPY server/tsconfig.json ./server/
  COPY shared ./shared
  RUN cd server && npm install
  COPY server/ ./server/
  RUN cd server && npm run build

  # Stage 3: Unified Production Image
  FROM node:20-alpine
  WORKDIR /app

  # Copy server dependency manifest and install production modules
  COPY server/package*.json ./
  RUN npm ci --omit=dev

  # Copy compiled backend server files and shared references
  COPY --from=server-builder /app/server/dist ./dist
  COPY --from=server-builder /app/shared ./shared

  # Copy compiled frontend client static assets
  COPY --from=client-builder /app/client/dist ./client/dist

  # Set default production parameters
  ENV NODE_ENV=production
  ENV PORT=5000

  # Server-side healthcheck
  HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

  EXPOSE 5000
  CMD ["node", "dist/server/index.js"]
