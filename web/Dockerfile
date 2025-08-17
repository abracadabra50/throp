# Dockerfile for Throp Web Interface
FROM node:20-alpine

WORKDIR /app

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

# Start the Next.js app
CMD ["npm", "start"]
