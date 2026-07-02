# Stage 1: Build TypeScript backend code
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package descriptors
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/
COPY shared ./shared

# Install build dependencies
RUN cd server && npm install

# Copy source code files
COPY server ./server

# Compile TypeScript
RUN cd server && npm run build

# Stage 2: Serve compiled code in production
FROM node:20-alpine
WORKDIR /app

# Copy production package descriptors
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder stage
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/shared ./shared

# Set production env defaults
ENV NODE_ENV=production
ENV PORT=5000

# Health check to ensure server is listening
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

EXPOSE 5000
CMD ["node", "dist/index.js"]
