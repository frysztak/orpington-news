FROM node:18.14.0-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY . .
CMD node /app/index.js
