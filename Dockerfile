# Use Node.js 20 LTS official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps

# Build backend API (TypeScript → JavaScript)
RUN cd apps/api && npm run build && cd ../..

# Build frontend Next.js
RUN cd apps/web && npm run build && cd ../.. || true

# Expose ports
EXPOSE 3000 3001 3001

# Start application with backend
CMD ["npm", "start"]
