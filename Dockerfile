# syntax=docker/dockerfile:1

# node:24-alpine bundles whichever npm it was built with, and npm versions
# disagree about which transitive optional deps belong in the lock file. Pin it
# so `npm ci` behaves the same here as it does locally, and regenerate
# package-lock.json with this same version.
ARG NPM_VERSION=11.17.0

FROM node:24-alpine AS deps
WORKDIR /app
ARG NPM_VERSION
RUN npm i -g npm@${NPM_VERSION}

COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
ARG NPM_VERSION
RUN npm i -g npm@${NPM_VERSION}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# `output: "standalone"` traces only the modules the server imports, so the
# Prisma CLI is absent from the runtime image. Build the migration toolchain
# separately instead of dragging the whole dev dependency tree along: the CLI,
# plus the TypeScript loader and dotenv that prisma.config.ts needs to load.
# Versions match package-lock.json.
FROM node:24-alpine AS migrate-deps
WORKDIR /migrate
ARG NPM_VERSION
RUN npm i -g npm@${NPM_VERSION}

RUN npm init -y > /dev/null \
	&& npm i --no-audit --no-fund prisma@7.8.0 tsx@4.22.4 dotenv@17.4.2

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Bind every interface so the kubelet and Service can reach the container.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy built files
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

COPY --from=migrate-deps --chown=node:node /migrate /migrate
COPY --chown=node:node prisma /migrate/prisma
COPY --chown=node:node prisma.config.ts /migrate/prisma.config.ts

COPY --chown=node:node docker-entrypoint.sh /docker-entrypoint.sh

RUN mkdir -p .next/cache && chown node:node .next/cache

USER node
EXPOSE 3000
ENTRYPOINT ["sh", "/docker-entrypoint.sh"]
