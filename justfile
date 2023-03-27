##
## Run for development (with watch mode)
##

# Run frontend and API
dev: (parallel "web" "api")

[private]
web:
  cd frontend && \
  cp ../.env.local .env && \
  npm run dev
  
[private]
api:
  cd backend && \
  cp ../.env.local .env && \
  cargo watch -q -x run | bunyan

##
## Run for e2e test development (with watch mode)
##

[private]
web-e2e:
  cd frontend && \
  cp ../.env.e2e.local .env && \
  npm run dev
 
[private]
api-e2e:
  cd backend && \
  cp ../.env.e2e.local .env && \
  cargo watch -q -x run --features e2e | bunyan
  
# Run frontend and API for E2E test development
dev-e2e: (parallel "web-e2e" "api-e2e")

# Builds and starts Docker E2E container
docker-e2e:
  docker buildx build -f docker/Dockerfile.e2e \
  -t orpington-news-e2e:latest \
  --build-arg INSTRUMENT_COVERAGE=true \
  --build-arg DISABLE_SW=true \
  .

  docker compose -f docker-compose.e2e.yml up -d
  
# Opens Cypress (local)
cypress-open:
  cd e2e && \
  cp ../.env.e2e.local .env && \
  npm run cypress:open

# Opens Cypress (Docker)
cypress-open-docker:
  cd e2e && \
  cp ../.env.e2e .env && \
  npm run cypress:open
  
# Runs Cypress (local)
cypress-run:
  cd e2e && \
  cp ../.env.e2e.local .env && \
  npm run cypress:run

# Runs Cypress (Docker)
cypress-run-docker:
  cd e2e && \
  cp ../.env.e2e .env && \
  npm run cypress:run
  
# runs jobs in parallel
# thank you https://github.com/casey/just/issues/626#issuecomment-1464811402
# replace with built-in parallel job execution once https://github.com/casey/just/pull/1562 lands
[private]
parallel arg1 arg2:
  #!/bin/bash -eux
  just {{arg1}} &
  just {{arg2}} &
  trap 'kill $(jobs -pr)' EXIT
  wait
