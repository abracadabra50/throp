# Dockerfile for Throp Web Interface - v2
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve conflicts
RUN npm ci --legacy-peer-deps

# Copy all source files
COPY . .

# Install SWC dependencies after copying files
RUN npm install

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
