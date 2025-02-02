# Base from official Node (Alpine LTS) image
FROM node:lts-alpine

# Install system dependencies for native modules and Python distutils
RUN apk update && apk add --no-cache \
    build-base \
    python3 \
    py3-setuptools

# Install simple http server for serving static content
RUN npm install -g http-server

# Install TypeScript compiler
RUN npm install -g typescript

# Install ts-node (to run/debug .ts files without manual transpiling)
RUN npm install -g ts-node

# Set /app as working directory (in development mode for mounting source code)
WORKDIR /app

# Override default CMD for image ("node"): launch the shell
CMD sh

# Listen on ports
EXPOSE 5173 4173

# Add label for GitHub container registry
LABEL org.opencontainers.image.description='An initial development image based on the official \
    Node.js (on Alpine LTS) image, and further configured with a HTTP server, TypeScript compiler, \
    and ts-node. This is merely to provide an execution sandbox and does not contain source files.'
