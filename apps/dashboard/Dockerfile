FROM node:22-alpine AS base

WORKDIR /app

# Remove yarn to prevent Next.js SWC lockfile patching from using it
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg

# Install deps
COPY package.json package-lock.json turbo.json ./
COPY apps/dashboard/package.json apps/dashboard/
RUN npm install --workspace=apps/dashboard

# Copy source
COPY apps/dashboard/ apps/dashboard/

# Build Next.js (standalone output)
RUN npm run build --workspace=apps/dashboard

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=base /app/apps/dashboard/.next/standalone ./
COPY --from=base /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=base /app/apps/dashboard/public ./apps/dashboard/public

EXPOSE 3001

CMD ["node", "apps/dashboard/server.js"]
