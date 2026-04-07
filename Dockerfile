FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DB_PATH=/app/data/helpdesk.db
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/app/icon.svg ./src/app/icon.svg
COPY entrypoint.sh ./entrypoint.sh
RUN mkdir -p /app/data && chmod +x ./entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]
