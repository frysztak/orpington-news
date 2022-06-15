#!/bin/bash

set -e

REMOTE_HOST="ovh"
IMAGE_NAME="frysztak/orpington-news:demo"

git checkout master
git pull

VERSION=$(cat package.json | jq '.version' | tr -d '"')-demo
COMMIT_SHA=$(git rev-parse HEAD)

echo "Building with args:"
echo "  image=${IMAGE_NAME}"
echo "  VERSION=${VERSION}"
echo "  COMMIT_SHA=${COMMIT_SHA}"

docker buildx build -t ${IMAGE_NAME} \
 --build-arg DEMO_MODE=true \
 --build-arg COMMIT_SHA=${COMMIT_SHA} \
 --build-arg BUILD_VERSION=${VERSION} \
 -f docker/Dockerfile .
docker save ${IMAGE_NAME} | bzip2 | pv | ssh $REMOTE_HOST 'bunzip2 | docker load'

ssh -tt $REMOTE_HOST << EOF
dokku git:from-image news-demo ${IMAGE_NAME} 
exit
EOF

git checkout -