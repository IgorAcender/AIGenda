# Use Node.js 20 LTS official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Prisma on Alpine needs OpenSSL available at runtime/build time
RUN apk add --no-cache openssl

# Copy all project files
COPY . .

# Install dependencies (including devDependencies for build tools like tsc)
RUN npm install --legacy-peer-deps --ignore-scripts --no-audit --no-fund

# Generate Prisma Client for the API workspace (monorepo/workspaces need explicit generate)
RUN cd apps/api && npm run generate && cd ../..

# Build backend API (TypeScript → JavaScript in dist/)
RUN cd apps/api && npm run build && cd ../..

# Build frontend Next.js (optional - can fail)
RUN cd apps/web && npm run build && cd ../.. || true

# Remove devDependencies to reduce image size (optional, recommended for production)
# Note: prefer prune to avoid re-installing and losing generated Prisma Client.
# RUN npm prune --omit=dev

# Expose ports
EXPOSE 80 3000 3001

# Start frontend (Next) on port 3000 in background, then start API on 3001 in foreground
# Easy Panel Nginx will route requests accordingly
CMD ["sh", "-c", "cd apps/web && PORT=3000 npm run start & cd /app && PORT=3001 node apps/api/dist/index.js"]
