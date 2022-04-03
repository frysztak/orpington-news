# BASE
FROM node:16-alpine as base

# BUILDER
FROM base as builder

WORKDIR /app
COPY package.json yarn.lock lerna.json ./
COPY packages/shared/package.json /app/packages/shared/package.json
COPY packages/frontend/package.json /app/packages/frontend/package.json
COPY packages/backend/package.json /app/packages/backend/package.json
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

COPY . /app
RUN yarn build && rm -rf packages/**/node_modules

# RUNTIME
FROM nginx:alpine as runtime

RUN apk add --no-cache nodejs yarn
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn global add pm2

WORKDIR /app
COPY docker/apps.json docker/run.sh ./
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/packages/backend /app/packages/backend
COPY --from=builder /app/yarn.lock /app/packages/backend
COPY --from=builder /app/packages/frontend /app/packages/frontend
COPY --from=builder /app/yarn.lock /app/packages/frontend

WORKDIR /app/packages/backend
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --production --ignore-scripts --prefer-offline --ignore-optional --frozen-lockfile

WORKDIR /app/packages/frontend
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --production --ignore-scripts --prefer-offline --ignore-optional --frozen-lockfile

ARG COMMIT_SHA ""
ENV NEXT_PUBLIC_GIT_COMMIT_HASH $COMMIT_SHA
EXPOSE 8000
CMD /bin/sh /app/run.sh














#ENV NODE_ENV=production
#EXPOSE 5000
#CMD ["node", "dist/server.js"]
#
## FRONTEND
#FROM base as frontend
#
#WORKDIR /app
#COPY --from=builder /app/package.json .
#COPY --from=builder /app/yarn.lock .
#COPY --from=builder /app/packages/shared /app/packages/shared
#COPY --from=builder /app/packages/frontend /app/packages/frontend
#
#WORKDIR /app/packages/frontend
#RUN yarn install --production --ignore-scripts --prefer-offline --ignore-optional --pure-lockfile && yarn cache clean
#
#EXPOSE 3000
#CMD ["node_modules/.bin/next", "start"]