FROM debian:buster-slim

# install node.js:14.x
RUN apt update --no-install-recommends -yq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash \
    && apt-get install nodejs -yq \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# install typescript compiler globally
RUN npm install -g typescript

# install Dart
RUN apt-get update --no-install-recommends -yq \
    && apt-get install -y gnupg \
    && apt-get install -y wget \
    && apt-get install apt-transport-https \
    && sh -c 'wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -' \
    && sh -c 'wget -qO- https://storage.googleapis.com/download.dartlang.org/linux/debian/dart_stable.list > /etc/apt/sources.list.d/dart_stable.list' \
    && apt-get update --no-install-recommends -yq \
    && apt-get install --no-install-recommends dart \
    && rm -rf /var/lib/apt/lists/*

LABEL org.opencontainers.image.description='An initial development image based on a slimmed Debian 10.7 (buster), and further configured with Node.js v14, TypeScript compiler, and Dart-SDK. This does not contain any source files.'

WORKDIR /app

EXPOSE 3000 80
