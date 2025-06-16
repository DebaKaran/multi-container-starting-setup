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
