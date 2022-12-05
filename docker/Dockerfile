# BASE
FROM node:16.17.1-alpine as base

# BUILDER
FROM base as builder
ARG TARGETARCH

# fix for @parcel/watcher missing pre-built package for Linux ARM64
# https://github.com/parcel-bundler/watcher/issues/102
RUN if [ "arm64" = "$TARGETARCH" ]; then \
      apk add --no-cache git make clang build-base python3; \
    fi
WORKDIR /app
COPY package.json yarn.lock lerna.json .yarnrc.yml ./
COPY .yarn/ ./.yarn/
COPY packages/shared/package.json /app/packages/shared/package.json
COPY packages/frontend/package.json /app/packages/frontend/package.json
COPY packages/backend/package.json /app/packages/backend/package.json
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

COPY . /app

ARG INSTRUMENT_COVERAGE
ENV INSTRUMENT_COVERAGE=${INSTRUMENT_COVERAGE}
ARG DISABLE_SW
ENV DISABLE_SW=${DISABLE_SW}
ARG DEMO_MODE
ENV NEXT_PUBLIC_APP_DEMO=${DEMO_MODE}
ARG COMMIT_SHA
ENV NEXT_PUBLIC_GIT_COMMIT_HASH=${COMMIT_SHA}
ARG BUILD_VERSION
ENV NEXT_PUBLIC_VERSION=${BUILD_VERSION}

RUN yarn build && rm -rf packages/**/node_modules

# RUNTIME
FROM nginx:alpine as runtime

RUN apk add --no-cache nodejs icu-data-full yarn
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn global add pm2

WORKDIR /app
COPY docker/apps.json docker/run.sh ./
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/.yarnrc.yml .
COPY --from=builder /app/.yarn .yarn

COPY --from=builder /app/packages/backend/dist /app/packages/backend
COPY --from=builder /app/packages/backend/db/migrations /app/packages/backend/db/migrations
COPY --from=builder /app/packages/backend/package.json /app/packages/backend/package.json

COPY --from=builder /app/packages/frontend/public /app/packages/frontend/public
COPY --from=builder /app/packages/frontend/package.json /app/packages/frontend/package.json
COPY --from=builder /app/packages/frontend/.next/standalone /app/packages/frontend
COPY --from=builder /app/packages/frontend/.next/static /app/packages/frontend/.next/static

WORKDIR /app/packages/backend
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn workspaces focus --production
WORKDIR /app

EXPOSE 8000
CMD /bin/sh /app/run.sh
