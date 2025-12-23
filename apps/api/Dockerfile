FROM node:20-alpine AS base

# Install OpenSSL 3.0 for Prisma (Alpine 3.18+ has openssl 3)
RUN apk add --no-cache openssl libc6-compat

# Set Prisma to use OpenSSL 3.0
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Dependencies stage
FROM base AS deps
# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies (without lockfile since we're in a subpackage)
RUN pnpm install

# Generate Prisma client here (no DB connection needed for generate)
RUN npx prisma generate

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN pnpm run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Regenerate Prisma client in production stage
RUN npx prisma generate

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

EXPOSE 3001
