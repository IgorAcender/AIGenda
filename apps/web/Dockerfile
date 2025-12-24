# Build HTMX frontend instead of Next.js
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Dependencies
FROM base AS deps
# Copy package.json from frontend-htmx
COPY ../../frontend-htmx/package.json ./
RUN pnpm install --prod

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy dependencies
COPY --from=deps --chown=fastify:nodejs /app/node_modules ./node_modules

# Copy HTMX frontend source
COPY --chown=fastify:nodejs ../../frontend-htmx/src ./src
COPY --chown=fastify:nodejs ../../frontend-htmx/views ./views
COPY --chown=fastify:nodejs ../../frontend-htmx/public ./public
COPY --chown=fastify:nodejs ../../frontend-htmx/package.json ./package.json

USER fastify

EXPOSE 3000

ENV PORT=3000
ENV HOST="0.0.0.0"

CMD ["node", "src/server.js"]
