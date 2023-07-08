FROM lukemathwalker/cargo-chef:latest-rust-1.70.0 AS chef
WORKDIR /app

FROM chef AS planner
COPY backend .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS api-builder
COPY --from=planner /app/recipe.json recipe.json
ENV CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --features spa --recipe-path recipe.json
# Build application
COPY backend .

RUN cargo build \
  --release \
  --features spa

# BUILDER
FROM node:18.14.0-alpine as web-builder
ARG TARGETARCH

# fix for @parcel/watcher missing pre-built package for Linux ARM64
# https://github.com/parcel-bundler/watcher/issues/102
RUN if [ "arm64" = "$TARGETARCH" ]; then \
      apk add --no-cache git make clang build-base python3; \
    fi
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci && npm cache clean --force

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

COPY frontend .
RUN npm run build && npm run export

# RUNTIME
FROM gcr.io/distroless/cc-debian11 as runtime

WORKDIR /app
COPY --from=api-builder /app/target/release/backend /app/backend
COPY --from=web-builder /app/out /app/web

EXPOSE 8000
ENV PORT=8000
CMD ["/app/backend"]
