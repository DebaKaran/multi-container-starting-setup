#!/bin/bash
echo "Running Dev Mode on port 3001 ..."
docker-compose down
export BUILD_TARGET=dev
export PORT=3001
docker-compose -f docker-compose.yaml -f docker-compose.override.yaml up -d --build
