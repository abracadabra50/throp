# Production Dockerfile for Throp
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY src ./src
COPY bin ./bin

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm pkg delete scripts.prepare && \
    npm ci --omit=dev --no-audit --no-fund

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 3001

# Use the start script
CMD ["./start.sh"]