FROM node:20-alpine AS base

# Install OpenSSL 3.0 for Prisma (Alpine 3.18+ has openssl 3)
RUN apk add --no-cache openssl libc6-compat

# Set Prisma to use OpenSSL 3.0
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Production stage (sem build, usa tsx diretamente)
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy package files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Copy prisma schema
COPY apps/api/prisma ./apps/api/prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json

# Generate Prisma client
RUN cd apps/api && npx -y prisma@5 generate

EXPOSE 3001

# Usa tsx para rodar TypeScript diretamente (simples e funcional)
CMD ["npx", "tsx", "apps/api/src/index.ts"]
