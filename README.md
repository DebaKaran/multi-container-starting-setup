A full-stack app using MongoDB, Express, and React, containerized using Docker Compose. Includes a seed service to preload sample data into the databas

Tech Stack:

1: Frontend: React (Vite or CRA)

2: Backend: Node.js, Express, Mongoose

3: Database: MongoDB (Dockerized)

4: Containerization: Docker, Docker Compose

Project Structure:

.
├── backend
│ ├── models
│ ├── logs
│ ├── app.js
│ └── .env
├── frontend
│ └── src
├── docker-compose.yaml
├── README.md

# multi-container-starting-setup

multi-container-starting-setup

1: Create a Docker Network:

docker network create goals-network

2: Start MongoDB Container

# docker run -d --name mongodb --network goals-network --env-file .env mongo:8.0.10

docker run -d --name mongodb --network goals-network --env-file .env -v mongo-data:/data/db mongo:8.0.10

3: Verify MongoDB Credentials

If the container is already running, exec into it and try logging in manually:

docker exec -it mongodb mongosh -u root -p deba1234 --authenticationDatabase admin

4: Backend Setup

A: Build Backend Image
docker build -t goals-node .

B: Run Backend Container:

docker run --name goals-backend --rm -d -p 8070:8070 --network goals-network goals-node

5: Frontend (React) Setup

A. Build Frontend Image:
docker build -t goals-react .

B. Run Frontend Container:

docker run --name goals-frontend --rm -d -it -p 3000:3000 --network goals-network goals-react

- Now update the backend container with volumes

docker run --name goals-backend --rm -d -p 8070:8070 --network goals-network -v logs:/app/logs -v "$(pwd)/backend:/app" -v /app/node_modules goals-node

-- Backend Development with Nodemon

We use nodemon to automatically restart the Node.js server whenever file changes are detected. This improves developer productivity by eliminating the need to manually stop and restart the server after each code change.

"scripts": {
"start": "nodemon app.js"
}

nodemon watches the files and reloads the server, making local development faster and smoother.

-- Notes for Development with Docker and Nodemon

-- Using nodemon with Docker for Hot Reloading

During development, we use nodemon to automatically restart the backend server when code changes are made. However, when running inside a Docker container on Windows (especially with WSL2), nodemon sometimes fails to detect file changes from the bind mount.

Issue Encountered:

Even though app.js was updated in the local system and the container had the updated file (verified using cat), nodemon still ran the old version of the app. This happened because:

A: nodemon didn’t detect the file change at startup.

B: The Docker bind mount was working, but the watcher missed the event.

Solution:
Create a nodemon.json file in the backend project directory with the following content:

{
"watch": ["."],
"ext": "js,json",
"delay": "500",
"legacyWatch": true,
"ignore": ["node_modules"]
}

This ensures that nodemon:

A: Uses legacy watch mode (required for file watching in Docker on Windows).

B: Ignores noisy folders like node_modules.

C: Watches all .js and .json files in the app folder.

-- Backend Container Run Command (with Volume Bind Mount)

Use the following command to run the backend container with logs and source code mounted:

docker run --name goals-backend \
 --rm -d \
 -p 8070:8070 \
 --network goals-network \
 -v logs:/app/logs \
 -v "/absolute/path/to/your/local/backend:/app" \
 -v /app/node_modules \
 goals-node

Replace:
/absolute/path/to/your/local/backend with your actual project path on your system (e.g., /run/desktop/mnt/host/c/Users/your-name/project/backend on Windows+WSL).

-- Live Reload for React (Frontend) in Docker

To enable live reload while developing React inside Docker, we use bind mounts:

docker run --name goals-frontend --rm -d -it -p 3000:3000 -v "/run/desktop/mnt/host/c/Users/your-name/project/frontend/src:/app/src" -v /app/node_modules goals-react

A: -v /local/src:/app/src: Ensures local code changes are reflected immediately in the container.

B: -v /app/node_modules: Prevents the container’s node_modules from being overwritten by an empty local directory.

-- docker-compose.yaml file

1: The MongoDB container loads its credentials from a .env file located at ./backend/.env.
Sample .env file:

2: To start the containers: docker-compose up --build -d

3: To stop and remove the containers: docker-compose down

4: Volumes:

A: ./backend:/app: Mounts your local backend code inside the container so code changes are reflected live.

B: /app/node_modules: Prevents overwriting container-installed node_modules with your empty local folder.

C: logs:/app/logs: Persists backend logs separately in a named Docker volume.

D: mongo-data:/data/db: Persists MongoDB data across container restarts.

-- Container Names

By default, Docker Compose generates container names using this format:

<project-directory-name>\_<service-name>\_1

-- frontend

A: volumes:

A1: ./frontend/src:/app/src: Enables live reloading of React code.

A2: /app/node_modules: Prevents local empty node_modules from overwriting container dependencies.

B: stdin_open: true and tty: true:

These settings are necessary for React’s development server to run properly inside the container in interactive/watch mode.

C: depends_on:

Ensures the backend container is up and running before starting the frontend, which may depend on it for API requests.

------------- INCLUDING SEED CONTAINER -----------------

Now Project Structure:

├── backend
│ ├── models
│ ├── util
│ ├── logs
│ ├── app.js
│ ├── seed.js
│ └── .env
├── frontend
│ └── src
├── docker-compose.yaml
├── README.md

Build and run the containers: docker-compose up --build

Seed the database (run once): docker-compose run --rm seed

Application URLs

1: Frontend: http://localhost:3000

2: Backend API: http://localhost:8070/goals

API Endpoints:

1: GET /goals – Fetch all goals

2: POST /goals – Add new goal ({ text: "some goal" })

3: DELETE /goals/:id – Delete goal by ID

The seed service reuses the backend container and uses seed.js to populate MongoDB.

### Multi-stage docker build

Frontend Docker Build (Multi-Stage):

The frontend React app is built using a multi-stage Dockerfile:

1: Stage 1:

Uses node:20 image

Runs npm install

Runs npm run build → creates static optimized React files in /app/build

2️: Stage 2:

Uses lightweight nginx:stable-alpine image

Copies /app/build → /usr/share/nginx/html

Serves static files via Nginx on port 80

### No multi-stage is required for backend application

## 📦 Docker Setup — Two Dockerfiles Approach

This project uses **two separate Dockerfiles** to support both development and production environments:

### 🚀 Development — Dockerfile.dev

- File: `Dockerfile.dev`
- Runs NodeJS container with React dev server (`npm start`)
- Supports live reload (via volumes)
- Used by `docker-compose.override.yaml`

To run in development:

```bash
docker-compose up --build

Result:

1: React app runs on http://localhost:3000

2: Live reload works — edit /src and browser updates automatically

Production — Dockerfile (multi-stage):

File: Dockerfile

Multi-stage build:

Stage 1 → NodeJS → npm run build → /app/build

Stage 2 → NGINX → serves static files from /usr/share/nginx/html

Small, optimized container for production ( Approximately 75 MB)

To run in production:
```

docker-compose -f docker-compose.yaml up --build -d

Result:

A: React app runs on NGINX on port 3000:80

B: No node_modules, no source code inside container — optimized image (~70 MB)

---

## Frontend Dockerfile — Multi-stage

The **frontend** uses a single `Dockerfile` with named stages:

```dockerfile
FROM node:20 AS dev          # Development stage (React Dev Server)
FROM node:20 AS frontend-react  # Production build stage (npm run build)
FROM nginx:stable-alpine     # Final nginx image (serving static build)

The target stage is controlled with: target: ${BUILD_TARGET:-dev}
(in docker-compose.override.yaml)

Power Shell:
$env:BUILD_TARGET="frontend-react"
$env:PORT = "3000"
docker-compose -f docker-compose.yaml up --build

BUILD_TARGET=frontend-react docker-compose -f docker-compose.yaml up --build

Developement:

$env:BUILD_TARGET="dev"
$env:PORT = "3001"
docker-compose up --build

or:

BUILD_TARGET=dev docker-compose up --build

or docker-compose up --build ( Dev is implicit)
```

Using node:20-slim for both Frotend and Backend, the image size improved by 75%

### Adding .dockerignore for Frontend and Backend

1️: Why we added .dockerignore files?

A: To avoid copying unnecessary files (like node_modules, .git, local .env, log files) into the Docker build context.

B: Reduces Docker image size.

C: Speeds up build time.

D: Prevents potential security issues (you don’t accidentally copy secrets into the container).

We added separate .dockerignore files inside:

/frontend/.dockerignore
/backend/.dockerignore

2️: What issue we faced?

The backend container was failing to connect to MongoDB due to AuthenticationFailed.

The error in logs showed:

MongoError: Authentication failed.
user: undefined

Cause:

A: .env file was not correctly passed inside the MongoDB container.
B: Backend was configured correctly — but failed because MongoDB was misconfigured.

The MongoDB container (mongo:8.0.10) requires:

-> MONGO_INITDB_ROOT_USERNAME

-> MONGO_INITDB_ROOT_PASSWORD

-> MONGO_INITDB_DATABASE

Initially, we used:

env_file:

- .env

This is not sufficient for the official mongo image, which expects environment: variables directly (not via env_file).

As a result, MongoDB was started without credentials → no user created → backend’s connection string failed → authentication error.

3️: How we resolved it?

For MongoDB container — switched to:

mongodb:
image: "mongo:8.0.10"
container_name: mongodb
environment:
MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
MONGO_INITDB_DATABASE: ${MONGO_DB}
volumes: - mongo-data:/data/db

B: For backend container:

backend:
env_file: - .env

C: Added proper .dockerignore:

node*modules
.git
.env
*.log
Dockerfile\_

Now:

MongoDB initializes correctly

Backend connects successfully

Images are smaller, builds are faster

### Migrating Environment Variables from Dockerfile to .env File

Context
In the initial version of this project, environment variables (such as APP_PORT) were hardcoded in the Dockerfile using:

# Example:

ENV APP_PORT=8070

MongoDB variables were also being passed inconsistently across containers — sometimes hardcoded, sometimes from .env, sometimes missing in compose.

What We Changed
We migrated all runtime environment variables (MongoDB credentials, backend port) into .env files.
Now:

1: ✅ The main .env in project root holds:

MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=\***\*\*\*\*\***
MONGO_INITDB_DATABASE=course-goals

2: ✅ The backend also uses:

APP_PORT=8070

via:

env_file:

- .env
- ./backend/env/.env.backend

✅ The Dockerfile no longer sets ENV APP_PORT=8070.
Instead, the container gets this value at runtime from .env.backend.

✅ The compose mongodb service now uses:

environment:
MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}

Why We Made This Change
1: Easier to manage environment variables in .env instead of inside Dockerfiles.
2: No need to rebuild Docker images when changing environment variables.
3: Clear separation of configuration (in .env) vs image build (in Dockerfile).
4: Supports multiple environments (development, production)

Issue We Faced
1: Authentication Failed

We kept seeing this error:
codeName: 'AuthenticationFailed'
nodemon app crashed

Root Cause

MongoDB creates the root user only once when the volume /data/db is first initialized.

If the .env file was incorrect during first run (wrong vars or not passed),

the persistent mongo-data volume stored the old, invalid user (or no user)

Later, even after fixing .env, the app kept failing because the old data remained in the volume!

How We Fixed It
1️: We ensured all services properly consumed .env (no mixing of ENV and env_file).
2️: We removed the old volume: docker-compose down -v

3: We rebuilt fresh: Now MongoDB creates the correct root user, and authentication succeeds.
Backend and seed containers now connect successfully.

#### Run Scripts for Development & Production

This project includes two PowerShell scripts for convenience:

Script Purpose
run-dev.ps1 Run in development mode (hot reload, port 3001)
run-prod.ps1 Run in production mode (frontend via nginx, port 3000 → 80)

Usage:

# For development mode (Vite dev server on port 3001)

.\run-dev.ps1

# For production mode (nginx reverse-proxy to frontend on port 3000)

.\run-prod.ps1

Notes:
These scripts are not copied into Docker images (.dockerignore) because they are only used locally for running docker-compose.

The scripts are versioned in git because they are helpful for any developer working on this project.

### Added Inital Jenkins File

### unable to prepare context: path "/frontend" not found

This typically occurs when the context in your docker-compose.override.yaml is set to an absolute path (/frontend) instead of a relative path (./frontend).

Update your docker-compose.override.yaml:

context: ./frontend

### Bind for 0.0.0.0:3000 failed: port is already allocated

When running the frontend container, you might see this error:

Bind for 0.0.0.0:3000 failed: port is already allocated

This means another process or container is already using host port 3000.

✅ Solution 1: Use Dynamic Ports in Dev:

In development, use a different port (e.g., 3001) by setting an environment variable:

export PORT=3001
export BUILD_TARGET=dev
docker-compose -f docker-compose.yaml -f docker-compose.override.yaml up --build

Or using the script :./run-dev.sh

#!/bin/bash
echo "Running Dev Mode on port 3001 ..."
docker-compose down
export BUILD_TARGET=dev
export PORT=3001
docker-compose -f docker-compose.yaml -f docker-compose.override.yaml up --build

In your docker-compose.yaml:

services:
frontend:
ports: - "${DEV_PORT:-3000}:3000"

This maps host port 3001 to container port 3000 when DEV_PORT is set.

2: ✅ Solution 2: Separate Dev and Prod Scripts
Use separate scripts to handle different environments.

run-dev.sh:

#!/bin/bash
echo "Running Dev Mode on port 3001 ..."
export BUILD_TARGET=dev
export DEV_PORT=3001
docker-compose -f docker-compose.yaml -f docker-compose.override.yaml up --build

run-prod.sh:

#!/bin/bash

echo "Running Prod Mode (nginx on port 3000 → 80) ..."

# Stop and remove existing containers

docker-compose -f docker-compose.yaml down

# Set environment variable for production target

export BUILD_TARGET=frontend-react

# Start and build containers using just the main compose file

docker-compose -f docker-compose.yaml up --build

Jenkins Integration Tip:

If you’re using Jenkins, you can invoke the script inside your pipeline:

stage('Build & Run Containers') {
steps {
dir("${env.WORKSPACE}") {
sh 'chmod +x run-dev.sh'
sh './run-dev.sh'
}
}
}

###added run-prod.sh for CI-safe production build

Docker build fails with:

Could not find a required file.
Name: index.js
Searched in: /app/src

Even though the file existed in your local project, the frontend/src/index.js was not available inside the Docker container.

This typically happens due to:

A: Incorrect volume mounts

B: .dockerignore or .gitignore accidentally ignoring the src/ folder

C: Jenkins workspace not having the correct files

D: Git repo not committing the frontend/src/index.js (especially if it was untracked locally)

Likely Culprit: Volume Override in Dev Mode

Your docker-compose.override.yaml contains:

volumes:

- ./frontend/src:/app/src
- /app/node_modules

This binds your local ./frontend/src over the container's /app/src.

So if the host volume is empty or mismatched, it overwrites what was built during COPY . . in the Dockerfile — removing index.js inside the container.

Solution: Remove the volumes block during Jenkins/dev build

Volumes like:

volumes:

- ./frontend/src:/app/src
- /app/node_modules

Should be used only during local dev, not CI.

So instead of run-dev.sh, run-prod.sh file:

#!/bin/bash

echo "Running Prod Mode (nginx on port 3000 → 80) ..."

# Stop and remove existing containers

docker-compose -f docker-compose.yaml down

# Set environment variable for production target

export BUILD_TARGET=frontend-react

# Start and build containers using just the main compose file

docker-compose -f docker-compose.yaml up --build

And Jenkinsfile Integration:

Use one or the other:

stage('Build & Run Containers') {
steps {
dir("${env.WORKSPACE}") {
sh 'chmod +x run-prod.sh'
sh './run-prod.sh'
}
}
}

1: For local development, keep using run-dev.sh.
2: In Jenkins/CI, always prefer run-prod.sh.

### Email Testing

### Making changes for intentionally causing the Jenkins pipeline to fail

Modify a step to deliberately fail. For example, in the Verify Frontend Code stage, change:

sh 'cat frontend/src/index.js'

to

sh 'cat frontend/src/this_file_does_not_exist.js'

### Email Notification Setup

To enable failure alert emails:

1: Create a Jenkins Secret Text credential with:

ID: notify-emails

Secret: your email address (e.g., your.email@example.com)

2: Configure SMTP in Jenkins:

-> Go to Manage Jenkins → Configure System

-> Under Extended E-mail Notification, add your SMTP settings

3: Your Jenkinsfile should use the credential securely:

environment {
NOTIFY_EMAILS = credentials('notify-emails')
}

post {
failure {
echo 'Pipeline failed! Sending alert...'
mail to: env.NOTIFY_EMAILS, // ✅ Secure way — no Groovy interpolation
subject: "Build Failed: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]",
body: "View details here: ${env.BUILD_URL}"
}
}

Security Tip: Avoid "${env.SECRET}" when referencing credentials. Use env.SECRET directly to prevent leakage in logs or stack traces.

## Jenkins Pipeline Parameters

This project supports dynamic Docker image tagging using Jenkins parameters.

### `IMAGE_TAG` Parameter

The Jenkins pipeline accepts a string parameter named `IMAGE_TAG` (default: `latest`). This value is passed into the pipeline and used to:

- Tag backend and frontend Docker images (e.g., `goals-backend:build-43`)
- Control behavior in the `prod-run.sh` deployment script
- Enable consistent tagging for image versioning and traceability

### Example Jenkins Usage

When running the pipeline:

- If prompted for `IMAGE_TAG`, enter a value like `v1.0.0` or `build-42`
- If left blank, it will default to `latest`

### Affected Files

- `Jenkinsfile`: Defines `parameters { string(name: 'IMAGE_TAG' ...) }`
- `prod-run.sh`: Uses `${IMAGE_TAG}` with fallback and passes it to Docker Compose
- `docker-compose.yaml`: Tags `backend` and `frontend` images using `${IMAGE_TAG}`

# Jenkins Pipeline with Dynamic Docker Image Tagging

This project demonstrates an automated Jenkins pipeline that builds and runs multi-container applications using Docker and `docker-compose`.

## Features

- GitHub webhook integration for auto-triggered Jenkins builds
- Dynamic Docker image tagging:
  - Uses `main-<BUILD_NUMBER>` when no tag is manually provided
  - Allows optional custom tags during manual Jenkins builds
- Executes a production-ready build script (`prod-run.sh`)
- Email notification on build failure using Jenkins credentials
- Builds and runs services defined in `docker-compose.yaml`

## Jenkinsfile Highlights

- Accepts an optional `IMAGE_TAG` parameter
- Defaults to `main-<BUILD_NUMBER>` if left as `'latest'`
- Runs `prod-run.sh` with the resolved tag
- Sends failure alert email using a preconfigured `notify-emails` credential

## prod-run.sh

This script:

- Shuts down any running containers
- Uses the passed `IMAGE_TAG` (or `latest` as fallback)
- Builds the containers with the given tag
- Starts the services in detached mode using `docker-compose`

## docker-compose.yaml

No changes needed in `docker-compose.yaml` — ensure your services (like `frontend`, `backend`) are tagged using `${IMAGE_TAG}` if image tagging is required.

---

## Example Manual Build

1. In Jenkins, click **Build with Parameters**
2. Provide an `IMAGE_TAG` (e.g., `release-1.0.0`) or leave as `'latest'` to auto-generate
3. Jenkins runs the pipeline, tags images accordingly, and runs the app using Docker Compose

---

## Email Notification

If a build fails, Jenkins sends an alert to the configured email address stored in `notify-emails` Jenkins credentials.

### Jenkins Pipeline Enhancements

This project uses a Jenkins pipeline defined in `Jenkinsfile` to automate the build and deployment process.

#### Parallel Build Stage Added

The pipeline now includes a `Parallel Build` stage which builds the frontend and backend simultaneously to speed up CI execution.

```groovy
stage('Parallel Build') {
  parallel {
    stage('Frontend Build') {
      ...
    }
    stage('Backend Build') {
      ...
    }
  }
}

A: The frontend service runs npm install and npm run build

B: The backend service runs npm install and npm run lint || true
```

