# Use Node.js 20 LTS official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies (including devDependencies for build tools like tsc)
RUN npm install --legacy-peer-deps

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
EXPOSE 3000 3001

# Start application
CMD ["npm", "start"]
