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
