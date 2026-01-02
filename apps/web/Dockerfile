FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Dependencies
FROM base AS deps
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app ./
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/next.config.js ./apps/web/

WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

WORKDIR /app/apps/web

CMD ["node", "node_modules/next/dist/bin/next", "start"]
