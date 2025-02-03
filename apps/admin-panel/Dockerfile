# Base image
FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml ./

COPY apps/admin-panel/package.json ./apps/admin-panel/
COPY lib/js/shared-web/package.json ./lib/js/shared-web/

COPY lib/js/shared-web ./lib/js/shared-web
COPY apps/admin-panel ./apps/admin-panel

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/admin-panel
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin-panel/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-panel/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-panel/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
