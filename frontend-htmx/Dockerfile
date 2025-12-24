# Build stage
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json ./
RUN pnpm install

# Production image
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

WORKDIR /app

# Copy node modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

USER fastify

EXPOSE 3000

CMD ["pnpm", "start"]
