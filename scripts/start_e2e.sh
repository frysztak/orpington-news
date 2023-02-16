#!/bin/bash

set -e

docker buildx build -f docker/Dockerfile.e2e \
  -t orpington-news-e2e:latest \
  --build-arg INSTRUMENT_COVERAGE=true \
  --build-arg DISABLE_SW=true \
  .
  
docker compose -f docker-compose.e2e.yml up -d