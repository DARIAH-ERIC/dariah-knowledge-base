# syntax=docker/dockerfile:1

# using alpine base image to avoid `sharp` memory leaks.
# @see https://sharp.pixelplumbing.com/install#linux-memory-allocator

# build
FROM node:22-alpine AS build

ENV PNPM_HOME="/app/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node .npmrc package.json pnpm-lock.yaml ./

ENV SKIP_INSTALL_SIMPLE_GIT_HOOKS=1

RUN pnpm fetch

COPY --chown=node:node ./ ./

ARG NEXT_PUBLIC_APP_BASE_URL
ARG NEXT_PUBLIC_BOTS
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
ARG NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME
ARG NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER
ARG NEXT_PUBLIC_KEYSTATIC_MODE
ARG NEXT_PUBLIC_MATOMO_BASE_URL
ARG NEXT_PUBLIC_MATOMO_ID
ARG NEXT_PUBLIC_REDMINE_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ORG
ARG NEXT_PUBLIC_SENTRY_PROJECT

# disable validation for runtime environment variables
ENV ENV_VALIDATION=public

RUN pnpm install --frozen-lockfile --offline

ENV BUILD_MODE=standalone
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# mount secrets which need to be available at build time
# RUN --mount=type=secret,id=MY_SECRET,uid=1000 MY_SECRET=$(cat /run/secrets/MY_SECRET) pnpm run build
RUN --mount=type=secret,id=AUTH_SECRET,uid=1000 \
		--mount=type=secret,id=EMAIL_CONTACT_ADDRESS,uid=1000 \
		--mount=type=secret,id=EMAIL_SMTP_PORT,uid=1000 \
		--mount=type=secret,id=EMAIL_SMTP_SERVER,uid=1000 \
		--mount=type=secret,id=DATABASE_DIRECT_URL,uid=1000 \
		--mount=type=secret,id=DATABASE_URL,uid=1000 \
		--mount=type=secret,id=KEYSTATIC_GITHUB_CLIENT_ID,uid=1000 \
		--mount=type=secret,id=KEYSTATIC_GITHUB_CLIENT_SECRET,uid=1000 \
		--mount=type=secret,id=KEYSTATIC_SECRET,uid=1000 \
		--mount=type=secret,id=SSHOC_MARKETPLACE_API_BASE_URL,uid=1000 \
		--mount=type=secret,id=SSHOC_MARKETPLACE_BASE_URL,uid=1000 \
		--mount=type=secret,id=SSHOC_MARKETPLACE_PASSWORD,uid=1000 \
		--mount=type=secret,id=SSHOC_MARKETPLACE_USER_NAME,uid=1000 \
			AUTH_SECRET=$(cat /run/secrets/AUTH_SECRET) \
			EMAIL_CONTACT_ADDRESS=$(cat /run/secrets/EMAIL_CONTACT_ADDRESS) \
			EMAIL_SMTP_PORT=$(cat /run/secrets/EMAIL_SMTP_PORT) \
			EMAIL_SMTP_SERVER=$(cat /run/secrets/EMAIL_SMTP_SERVER) \
			DATABASE_DIRECT_URL=$(cat /run/secrets/DATABASE_DIRECT_URL) \
			DATABASE_URL=$(cat /run/secrets/DATABASE_URL) \
			KEYSTATIC_GITHUB_CLIENT_ID=$(cat /run/secrets/KEYSTATIC_GITHUB_CLIENT_ID) \
			KEYSTATIC_GITHUB_CLIENT_SECRET=$(cat /run/secrets/KEYSTATIC_GITHUB_CLIENT_SECRET) \
			KEYSTATIC_SECRET=$(cat /run/secrets/KEYSTATIC_SECRET) \
			SSHOC_MARKETPLACE_API_BASE_URL=$(cat /run/secrets/SSHOC_MARKETPLACE_API_BASE_URL) \
			SSHOC_MARKETPLACE_BASE_URL=$(cat /run/secrets/SSHOC_MARKETPLACE_BASE_URL) \
			SSHOC_MARKETPLACE_PASSWORD=$(cat /run/secrets/SSHOC_MARKETPLACE_PASSWORD) \
			SSHOC_MARKETPLACE_USER_NAME=$(cat /run/secrets/SSHOC_MARKETPLACE_USER_NAME) \
		pnpm run build

# serve
FROM node:22-alpine AS serve

ENV PNPM_HOME="/app/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Prisma CLI is used in entrypoint script to apply migrations.
RUN pnpm add -g prisma@6

COPY --chown=node:node ./prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=node:node ./prisma/migrations ./prisma/migrations

COPY --from=build --chown=node:node /app/next.config.js ./
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/content ./content
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

# Ensure folder is owned by node:node when mounted as volume.
RUN mkdir -p /app/.next/cache/images

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
