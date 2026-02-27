# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

# Copy workspace root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files to preserve workspace structure
COPY apps/api/package.json ./apps/api/
COPY packages/api-routes/package.json ./packages/api-routes/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install all dependencies (dev included for build)
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build

# Copy shared configs
COPY packages/tsconfig/ ./packages/tsconfig/

# Copy shared package source and build it first
COPY packages/api-routes/ ./packages/api-routes/
RUN pnpm --filter @hris-v2/api-routes build

# Copy API source
COPY apps/api/ ./apps/api/

# Build the API
RUN pnpm --filter @hris-v2/api build

# ---- Production ----
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

ENV NODE_ENV=production
WORKDIR /app

# Copy workspace root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace resolution
COPY apps/api/package.json ./apps/api/
COPY packages/api-routes/package.json ./packages/api-routes/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/api-routes/dist ./packages/api-routes/dist
COPY --from=build /app/packages/tsconfig/ ./packages/tsconfig/

# Copy drizzle migrations
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle

WORKDIR /app/apps/api

EXPOSE 3333

RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["node", "dist/index.js"]
