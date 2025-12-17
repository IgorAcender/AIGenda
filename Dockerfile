# Use Node.js 20 LTS official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps

# Make scripts executable
RUN chmod +x build.sh || true

# Build application
RUN npm run build --workspace=apps/web && npm run build --workspace=apps/api || true

# Expose ports
EXPOSE 3000 3001

# Start application
CMD ["npm", "start"]
