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

# Copy root package files for workspace
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy app-specific files
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder

# Copy everything from deps
COPY --from=deps /app ./

# Copy source code and config
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/tsconfig.build.json ./apps/api/tsconfig.build.json

# Build TypeScript (usando tsconfig de produção)
RUN cd apps/api && npx tsc -p tsconfig.build.json

# Production stage
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Install all dependencies (including devDependencies for prisma)
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

RUN pnpm install --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Generate Prisma files (run before starting the app)
RUN cd apps/api && npx -y prisma@5 generate

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
