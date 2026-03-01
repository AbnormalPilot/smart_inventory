FROM node:22-alpine AS base

WORKDIR /app

# Disable Next.js SWC lockfile patching — npm resolves platform-specific
# optional deps correctly; the patcher crashes on workspace lockfiles
# generated on a different OS (e.g. macOS → Alpine Linux).
ENV NEXT_SWC_DISABLE_LOCKFILE_PATCH=1
ENV NEXT_TELEMETRY_DISABLED=1

# Install deps — copy all workspace package.json files so npm can resolve
# the workspace graph from the root lockfile
COPY package.json package-lock.json turbo.json ./
COPY apps/landing/package.json apps/landing/
RUN npm install --workspace=apps/landing

# Copy source
COPY apps/landing/ apps/landing/

# Build Next.js (standalone output)
RUN npm run build --workspace=apps/landing

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=base /app/apps/landing/.next/standalone ./
COPY --from=base /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=base /app/apps/landing/public ./apps/landing/public

EXPOSE 3000

CMD ["node", "apps/landing/server.js"]
