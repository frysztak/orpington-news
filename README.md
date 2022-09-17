# Orpington News

[![release](https://img.shields.io/github/v/release/frysztak/orpington-news)](https://github.com/frysztak/orpington-news/releases)
[![image-size](https://ghcr-badge.herokuapp.com/frysztak/orpington-news/size)](https://github.com/frysztak/orpington-news/pkgs/container/orpington-news)
[![license](https://img.shields.io/github/license/frysztak/orpington-news)](https://github.com/frysztak/orpington-news/blob/master/LICENSE)

[![cicd-dev](https://github.com/frysztak/orpington-news/actions/workflows/dev.yml/badge.svg)](https://github.com/frysztak/orpington-news/actions/workflows/dev.yml)
[![cicd-master](https://github.com/frysztak/orpington-news/actions/workflows/main.yml/badge.svg)](https://github.com/frysztak/orpington-news/actions/workflows/main.yml)

Orpington News is a self-hosted RSS/Atom feed reader with PWA support.

![screenshot-1](./assets/screenshot.webp)

## Features

- Supports RSS 1.0/RSS 2.0/Atom feeds
- Supports nested collections (groups of feeds)
- Light and dark theme
- Syntax highlighting in code snippets
- Mobile-friendly UI
- PWA support
- RSS feed auto-detection from page URL
- Small Docker image size (170 MB uncompressed)

Demo instance is available [here](https://news-demo.orpington.software/).

## Installation

You need two things: Docker and PostgresSQL instance.

Docker image (`ghcr.io/frysztak/orpington-news`) exposes the app on port `8000`. You also need to provide a handful of environmental variables:

- `APP_URL`
- `DB_HOST`
- `DB_PASS`
- `COOKIE_SECRET` - at least 32 characters long random string. If not set will use a fallback value. You can use `openssl rand -base64 32` to generate it.

For `DB_PASS` and `COOKIE_SECRET`, `_FILE` suffix is also supported. For example, `DB_PASS_FILE=./secrets/db_pass` will read database
password from file `secrets/db_pass`. All variables are described in [Wiki page](https://github.com/frysztak/orpington-news/wiki/Env-variables).

Sample `docker-compose.yml` using Traefik is available [here](https://github.com/frysztak/orpington-news/blob/master/docker-compose.yml).

## Development quick start

Orpington News is organized as a monorepo using Lerna. To run it, you need:

- Node 16 (if you're using [nvm](https://github.com/nvm-sh/nvm), `.nvmrc` is provided)
- (optional) Docker, if you want to easily setup Postgres

Step-by-step guide:

1. Checkout the repo:

- `dev` branch, if you want latest and greatest
- `master` branch, if you want last tagged release

2. Install all dependencies:

```sh
$ yarn install --immutable
```

3. Build packages:

```sh
$ yarn build
```

4. Start Postgres instance. You can do it any way you like, but for convenience, a `docker-compose.db.yml` file is provided. To run it:

```sh
$ cd packages/backend
$ docker-compose -f docker-compose.db.yml up -d
```

You should be able now to access pgAdmin at `http://localhost:8080`.

5. Create `.env.local` file:

```
DB_USER="orpington"
DB_PASS="pass1234"
DB_HOST="localhost"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_GIT_COMMIT_HASH="dev"
NEXT_PUBLIC_VERSION="dev
```

if you ran the DB using provided compose file, you shouldn't have to change anything.

6. Run `yarn dev`. This will start both frontend and backend.
   You should be able to access the app on `http://localhost:3000`, API will be available on `http://localhost:5000`. You'll need to create your user account. That's it!

## License

- [GNU GPL v3](http://www.gnu.org/licenses/gpl.html)
- Copyright 2021-2022
