# Use Node.js 20 LTS official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY .npmrc ./
COPY build.sh ./
COPY start.sh ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Make scripts executable
RUN chmod +x build.sh start.sh

# Build application
RUN ./build.sh

# Expose ports
EXPOSE 3000 3001

# Start application
CMD ["npm", "start"]
