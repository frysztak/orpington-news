FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY backend .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS api-builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY backend .

RUN cargo build \
  --release \
  --features spa

# BUILDER
FROM node:18.12.1-alpine as web-builder
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

RUN yarn build && cd /app/packages/frontend && yarn next export

# RUNTIME
FROM gcr.io/distroless/cc-debian11 as runtime

# RUN apk add --no-cache nodejs>18.12.1-r0 icu-data-full yarn
# RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn global add pm2

WORKDIR /app
COPY --from=api-builder /app/target/release/backend /app/backend
COPY --from=web-builder /app/packages/frontend/out /app/web
# COPY docker/apps.json docker/run.sh ./
# COPY docker/nginx.conf /etc/nginx/nginx.conf
# COPY --from=builder /app/package.json .
# COPY --from=builder /app/yarn.lock .
# COPY --from=builder /app/.yarnrc.yml .
# COPY --from=builder /app/.yarn .yarn

#COPY --from=builder /app/packages/backend/dist /app/packages/backend
#COPY --from=builder /app/packages/backend/db/migrations /app/packages/backend/db/migrations
#COPY --from=builder /app/packages/backend/package.json /app/packages/backend/package.json

# COPY --from=builder /app/packages/frontend/public /app/packages/frontend/public
# COPY --from=builder /app/packages/frontend/package.json /app/packages/frontend/package.json
# COPY --from=builder /app/packages/frontend/.next/standalone /app/packages/frontend
# COPY --from=builder /app/packages/frontend/.next/static /app/packages/frontend/.next/static

#WORKDIR /app/packages/backend
#RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn workspaces focus --production
#WORKDIR /app

# WORKDIR /app/backend
# COPY --from=api-builder /app/target/x86_64-unknown-linux-musl/release/backend /app/backend/backend

EXPOSE 8000
ENV PORT=8000
CMD /app/backend
