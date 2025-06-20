# Use latest Node 20 base image
FROM node:20 AS frontend-react

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .

RUN npm install

# Copy rest of the application files
COPY . .

# Build React app (creates /build folder)
RUN npm run build

# Stage 2 - Production image (Nginx)
FROM nginx:stable-alpine

# Copy build output to Nginx html folder
COPY --from=frontend-react /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
