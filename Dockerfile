# base from official Node (Alpine LTS) image
FROM node:lts-alpine

# install simple http server for serving static content
RUN yarn global add http-server

# install typescript compiler
RUN yarn global add typescript

# install ts-node (to run/debug .ts files without manual transpiling)
RUN yarn global add ts-node

# set /app as working directory (in development mode for mounting source code)
WORKDIR /app

# override default CMD for image ("node"): launch the shell
CMD sh

# Listen on ports
EXPOSE 8080 8080
EXPOSE 8000 8000

# Add label for GitHub container registry
LABEL org.opencontainers.image.description='An initial development image based on the official \
    Node.js (on Alpine LTS) image, and further configured with a HTTP server, TypeScript compiler, \
    and ts-node. This is merely to provide an execution sandbox and does not contain source files.'
