# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ui/package.json ./apps/ui/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/tsconfig/package.json ./packages/tsconfig/

RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build

ARG VITE_API_URL=http://localhost:3333
ENV VITE_API_URL=${VITE_API_URL}

COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/contracts/ ./packages/contracts/
RUN pnpm --filter @hris-v2/contracts build

COPY apps/ui/ ./apps/ui/
RUN pnpm --filter @hris-v2/ui build

# ---- Production ----
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ui/package.json ./apps/ui/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/tsconfig/package.json ./packages/tsconfig/

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/apps/ui/dist ./apps/ui/dist

WORKDIR /app/apps/ui
EXPOSE 3000

RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["node", "dist/server/server.js"]
