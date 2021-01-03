FROM debian:buster-slim

# install node.js:14.x
RUN apt update --no-install-recommends -yq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash \
    && apt-get install nodejs -yq \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# update npm
RUN npm install -g npm

# install typescript compiler
RUN npm install -g typescript

# install ts-node (to run/debug .ts files without manual transpiling)
RUN npm install -g ts-node

LABEL org.opencontainers.image.description='An initial development image based on a slimmed Debian \
10.7 (buster), and further configured with Node.js v14, TypeScript compiler, and ts-node. This \
does not contain any source files.'

WORKDIR /app

EXPOSE 5000 9000
