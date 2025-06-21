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
