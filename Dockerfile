# Production Dockerfile for Throp
FROM node:20-alpine

WORKDIR /app

# Copy everything including built dist folder
COPY . .

# Install production dependencies
RUN npm pkg delete scripts.prepare && \
    npm ci --production --no-audit --no-fund

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3001

# Use the start script
CMD ["./start.sh"]