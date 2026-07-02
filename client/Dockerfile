# Stage 1: Build React application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install packages
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Set dynamic build arg for production API routing
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Run production build
RUN npm run build

# Stage 2: Serve static assets using Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built files
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check to ensure nginx is serving assets
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
