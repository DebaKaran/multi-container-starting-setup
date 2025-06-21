# Use latest Node 20 base image
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Set a default environment variable for port
ENV APP_PORT=8070

# Copy package.json and install dependencies
COPY package.json .

RUN npm install

# Copy rest of the application files
COPY . .

# Expose the default app port (can be overridden at runtime)
EXPOSE ${APP_PORT}

# Start the app using the environment-defined port
CMD [ "npm", "start" ]
