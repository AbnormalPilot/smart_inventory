FROM node:22-alpine AS base

WORKDIR /app

# Install root workspace deps
COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/
RUN npm install --workspace=apps/backend

# Copy backend source
COPY apps/backend/ apps/backend/

# Build TypeScript
RUN npm run build --workspace=apps/backend

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/package.json ./apps/backend/

WORKDIR /app/apps/backend

EXPOSE 7020

CMD ["node", "dist/index.js"]
