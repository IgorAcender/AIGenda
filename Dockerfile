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

# Build shared package first (needed by both API and web)
RUN cd packages/shared && npm run build && cd ../..

# Build backend API (TypeScript → JavaScript in dist/)
RUN cd apps/api && npm run build && cd ../..

# Build frontend Next.js to static HTML/CSS/JS (output: 'export' generates out/ folder)
RUN cd apps/web && npm run build && cd ../..

# Remove devDependencies to reduce image size (optional, recommended for production)
# Note: prefer prune to avoid re-installing and losing generated Prisma Client.
# RUN npm prune --omit=dev

# Expose ports
EXPOSE 80 3000 3001

# Start ONLY the API server (Express serves Next.js static files from .next/ and public/)
# This is a single process; no background jobs.
CMD ["node", "apps/api/dist/index.js"]
