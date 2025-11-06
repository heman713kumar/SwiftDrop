# --- Stage 1: Build the TypeScript code ---
# Use a Node.js image that includes all the tools we need to build.
FROM node:20-slim AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install all dependencies (including devDependencies for `tsc`)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Run the build script from package.json ("tsc") to compile TypeScript to JavaScript
RUN npm run build

# ---

# --- Stage 2: Create the final, lightweight production image ---
# Start from a clean, small Node.js image
FROM node:20-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install only production dependencies to keep the image small
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the compiled JavaScript code from the 'builder' stage into our new image
COPY --from=builder /usr/src/app/dist ./dist

# The app listens on port 3001, so we expose it
EXPOSE 3001

# The command to run when the container starts. This executes "node dist/server.js"
CMD [ "node", "dist/server.js" ]