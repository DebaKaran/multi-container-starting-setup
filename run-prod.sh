#!/bin/bash

echo "Running Prod Mode (nginx on port 3000 → 80) ..."

# Stop and remove existing containers
docker-compose -f docker-compose.yaml down

# Set environment variable for production target
export BUILD_TARGET=frontend-react

# Start and build containers using just the main compose file
docker-compose -f docker-compose.yaml up -d --build
