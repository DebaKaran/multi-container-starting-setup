#!/bin/bash

set -e

echo "Running Prod Mode (nginx on port 3000 → 80) ..."

# Use provided IMAGE_TAG or default to 'latest'
TAG=${IMAGE_TAG:-latest}
echo "Using Docker image tag: $TAG"

# Stop and remove existing containers
docker-compose -f docker-compose.yaml down

# Set environment variable for production target
export BUILD_TARGET=frontend-react

# Export TAG so it can be used in docker-compose as build-arg
export IMAGE_TAG=$TAG

# Start and build containers
docker-compose -f docker-compose.yaml up -d --build
