# Minimal Dockerfile - Pre-built locally
FROM node:20-alpine

WORKDIR /app

# Copy everything including built dist folder
COPY . .

# Install only production dependencies
RUN npm ci --production --no-audit --no-fund || \
    (npm cache clean --force && npm ci --production --no-audit --no-fund)

# Expose port
EXPOSE 3001

# Run directly
CMD ["node", "dist/api/server.js"]