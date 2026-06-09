# ==========================================
# STAGE 1: PRUNE (Extract only user-service)
# ==========================================
FROM node:22-alpine AS builder
# Add libc6-compat for turbo compatibility on alpine
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy the entire monorepo
COPY . .

# Extract only the user-service and its internal dependencies (shared-types)
RUN turbo prune @repo/user-service --docker

# ==========================================
# STAGE 2: INSTALL & BUILD
# ==========================================
FROM node:22-alpine AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy isolated package.json files from the prune stage
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies (this layer is heavily cached by Docker)
RUN pnpm install --frozen-lockfile

# Copy the actual source code of the isolated packages
COPY --from=builder /app/out/full/ .

# Build the project and its dependencies (shared-types -> user-service)
RUN pnpm turbo run build --filter=@repo/user-service

# ==========================================
# STAGE 3: RUNNER (Production Image)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy the built assets and node_modules from the installer stage
COPY --from=installer --chown=expressjs:nodejs /app .

# Expose the application port
EXPOSE 3002

# Start the compiled User Service application
CMD ["node", "apps/user-service/dist/index.js"]