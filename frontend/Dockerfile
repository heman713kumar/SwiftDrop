# --- Stage 1: Build the React application ---
# Use a Node.js image to get access to npm
FROM node:20-slim AS build-stage

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
# This is done first to take advantage of Docker's layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Run the build script from package.json ("tsc && vite build")
# This creates the optimized static files in the /app/dist directory
RUN npm run build

# ---

# --- Stage 2: Serve the application with Nginx ---
# Use a very small and efficient Nginx image
FROM nginx:stable-alpine

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the static files built in the previous stage into the Nginx public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# The Nginx image will automatically start the server when the container runs