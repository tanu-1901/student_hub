# ==============================================================================
# StudentPro Production Multi-Stage / Lightweight Dockerfile
# Optimized for Render, Railway, Fly.io, and Docker Compose
# ==============================================================================

# Base image using official Node.js 20 Alpine for minimal security footprint & size
FROM node:20-alpine

# Set non-root environment metadata
ENV NODE_ENV=production
ENV PORT=8000

# Set working directory inside container
WORKDIR /app

# Copy dependency definitions first to leverage Docker layer caching
COPY backend/package*.json ./backend/

# Install only production dependencies
RUN cd backend && npm install --omit=dev --no-audit --no-fund

# Copy frontend static assets and backend source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Expose default HTTP port
EXPOSE 8000

# Switch working directory to backend application directory
WORKDIR /app/backend

# Launch the Node.js Express server
CMD ["node", "server.js"]
