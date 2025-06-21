# Use latest Node 20 base image
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .

RUN npm install

# Copy rest of the application files
COPY . .

# Expose backend app port (declared in .env)
EXPOSE 8070

# Start the app using the environment-defined port
CMD [ "npm", "start" ]
