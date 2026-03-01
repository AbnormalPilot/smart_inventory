FROM node:22-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Remove yarn so Next.js SWC lockfile patcher doesn't try to use it.
# (It runs `yarn config get registry` which fails because corepack
#  misreads packageManager:"npm@11.7.0" as a yarn version string.)
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg

# Install deps
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
