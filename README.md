# Orpington News

Orpington News is a self-hosted RSS/Atom feed reader with PWA support.

## Features

- Supports RSS 1.0/RSS 2.0/Atom feeds
- Supports nested collections (groups of feeds)
- Light and dark theme
- Syntax highlighting
- Mobile-friendly UI
- PWA support

Demo instance is available [here](https://news-demo-app.orpington.software/).

## Installation

The only supported way to run Orpington News is to use Docker. Docker images are provided for both frontend and API. PostgreSQL instance is also needed.

Since this project is meant to be self-hosted, it makes no assumptions about how you configure stuff.

Sample `docker-compose.yml` using Traefik is available [here](https://github.com/frysztak/orpington-news/blob/master/docker-compose.yml).

### License

- [GNU GPL v3](http://www.gnu.org/licenses/gpl.html)
- Copyright 2021-2022
