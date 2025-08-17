# Minimal Dockerfile - Pre-built locally
FROM node:20-alpine

WORKDIR /app

# Copy everything including built dist folder
COPY . .

# Skip prepare script (husky) and install only production dependencies
RUN npm pkg delete scripts.prepare && \
    npm ci --production --no-audit --no-fund || \
    (npm cache clean --force && npm ci --production --no-audit --no-fund)

# Expose port
EXPOSE 3001

# Set environment variables
ENV ANSWER_ENGINE=hybrid-claude
ENV NODE_ENV=production
ENV PORT=3001
ENV API_PORT=3001

# Run ONLY the API server (not the bot)
CMD ["node", "dist/src/api/start.js"]