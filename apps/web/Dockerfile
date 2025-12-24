# HTMX + Fastify SSR Frontend
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json ./
RUN pnpm install --prod

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src/ ./src/
COPY views/ ./views/

USER fastify

EXPOSE 3000

CMD ["node", "src/server.js"]
