<p align="center">
  <img src="https://raw.githubusercontent.com/frysztak/orpington-news/master/assets/logo.png" width="200px" height="200px" alt="logo">
  <h1 align="center">Orpington News</h2>
  <p align="center">
    Orpington News is a self-hosted RSS/Atom feed reader with PWA support.
    <br>
    <br>
    <a href="https://news-demo.orpington.software">🎮 View Demo</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/frysztak/orpington-news/releases" target="_blank">
    <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/frysztak/orpington-news">
  </a>
  <a href="https://github.com/frysztak/orpington-news/pkgs/container/orpington-news" target="_blank">
    <img alt="Docker image size" src="https://ghcr-badge.herokuapp.com/frysztak/orpington-news/size">
  </a>
  <a href="https://github.com/frysztak/orpington-news/blob/master/LICENSE" target="_blank">
    <img alt="License" src="https://img.shields.io/github/license/frysztak/orpington-news">
  </a>
  <a href="https://codecov.io/gh/frysztak/orpington-news" target="_blank">
    <img alt="Codecov" src="https://codecov.io/gh/frysztak/orpington-news/branch/master/graph/badge.svg" />
  </a>
  <br />
  <a href="https://github.com/frysztak/orpington-news/actions/workflows/dev.yml" target="_blank">
    <img alt="Dev pipeline" src="https://github.com/frysztak/orpington-news/actions/workflows/dev.yml/badge.svg">
  </a>
  <a href="https://github.com/frysztak/orpington-news/actions/workflows/main.yml" target="_blank">
    <img alt="Main pipeline" src="https://github.com/frysztak/orpington-news/actions/workflows/main.yml/badge.svg">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#development-quick-start">Development Quick Start</a>
  <br />
  <br />
  <a href="https://user-images.githubusercontent.com/217806/195675958-3ecf972e-e9aa-437d-ad68-b7d29fcc6562.png" target="_blank">
    <img src="https://user-images.githubusercontent.com/217806/195675958-3ecf972e-e9aa-437d-ad68-b7d29fcc6562.png" width="640px" alt="dark theme screenshot" />
  </a>
</p>

## Features

<ul>
  <li>RSS 1.0/RSS 2.0/Atom feed support<br/></li>
  <li>Nested collections drag-n-drop
    <video src="https://user-images.githubusercontent.com/217806/195674330-62585a3f-f430-42a0-aa77-5aa576752137.mp4"></video>
  </li>
  </li>
  <li>Light and dark theme<br/>
    <a href="https://user-images.githubusercontent.com/217806/195675963-59a88540-2ac8-4876-a580-fe9e9884999c.png" target="_blank">
      <img src="https://user-images.githubusercontent.com/217806/195675963-59a88540-2ac8-4876-a580-fe9e9884999c.png" width="390px" alt="light theme screenshot" />
    </a>
    <a href="https://user-images.githubusercontent.com/217806/195675958-3ecf972e-e9aa-437d-ad68-b7d29fcc6562.png" target="_blank">
      <img src="https://user-images.githubusercontent.com/217806/195675958-3ecf972e-e9aa-437d-ad68-b7d29fcc6562.png" width="390px" alt="dark theme screenshot" />
    </a>
  </li>
  <li>Mobile-friendly UI with PWA support
    <video src="https://user-images.githubusercontent.com/217806/195639397-26eac0d2-4527-472a-bf7e-01cbed5e0e42.mp4"></video>
  </li>
  <li>Syntax highlighting in code snippets</li>
  <li>Configurable fonts
    <br/><br/>
    Supported article fonts:
    <ul>
      <li>Nunito (default)</li>
      <li>Ubuntu</li>
      <li>Lato</li>
      <li>OpenDyslexic</li>
    </ul>
    <br/>
    Supported monospace fonts:
    <ul>
      <li>Source Code Pro (default)</li>
      <li>Ubuntu Mono</li>
      <li>Fira Mono</li>
      <li>OpenDyslexic Mono</li>
    </ul>
    <br/>
    Settings live preview:<br/>
    <a href="https://user-images.githubusercontent.com/217806/195675969-1b50efd8-925c-4965-bfde-0443878c4a0d.png" target="_blank">
      <img src="https://user-images.githubusercontent.com/217806/195675969-1b50efd8-925c-4965-bfde-0443878c4a0d.png" width="640px" alt="settings screenshot" />
    </a>
  </li>
  <li>RSS feed auto-detection from page URL<br/>
    <video src="https://user-images.githubusercontent.com/217806/195674349-ab6a9a31-8dcd-4e2a-87f1-98cf2a16a0c2.mp4"></video>
  </li>
  </li>
  <li>OPML import</li>
  <li>Small Docker image size (170 MB uncompressed)</li>
</ul>

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
