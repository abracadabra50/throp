# Dockerfile for Throp Web Interface - v3 FORCE REBUILD
FROM node:20-slim

WORKDIR /app

# Install system dependencies for canvas/sharp if needed
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve conflicts
RUN npm ci --legacy-peer-deps

# Copy all source files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the Next.js app with PORT from environment
CMD ["sh", "-c", "npm start"]
