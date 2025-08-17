# Multi-stage Dockerfile for Throp
# Supports both API server and Twitter bot modes

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies with reduced memory usage
RUN npm ci --maxsockets 1

# Copy source code
COPY . .

# Build TypeScript with memory limit
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/env.example ./env.example

# Switch to non-root user
USER nodejs

# Expose API port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default to API server (can be overridden)
CMD ["npm", "run", "start:api"]
