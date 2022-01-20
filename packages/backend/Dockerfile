# BASE
FROM node:16-alpine as base

# BUILDER
FROM base as builder

WORKDIR /app
COPY package.json yarn.lock lerna.json ./
COPY packages/shared/package.json /app/packages/shared/package.json
COPY packages/frontend/package.json /app/packages/frontend/package.json
COPY packages/backend/package.json /app/packages/backend/package.json
RUN yarn install --frozen-lockfile

COPY . /app
RUN yarn lerna run build --scope @orpington-news/backend --include-dependencies --stream

# BACKEND
FROM base as backend

WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/packages/backend /app/packages/backend

WORKDIR /app/packages/backend
RUN yarn install --production --ignore-scripts --prefer-offline --ignore-optional --pure-lockfile && yarn cache clean

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/server.js"]
