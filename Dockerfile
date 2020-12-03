FROM debian:buster-slim

# install Dart
RUN apt-get update \
    && apt-get install -y gnupg \
    && apt-get install -y wget \
    && apt-get install apt-transport-https \
    && sh -c 'wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -' \
    && sh -c 'wget -qO- https://storage.googleapis.com/download.dartlang.org/linux/debian/dart_stable.list > /etc/apt/sources.list.d/dart_stable.list' \
    && apt-get update \
    && apt-get install --no-install-recommends dart \
    && rm -rf /var/lib/apt/lists/*

# install node.js:14.x
RUN apt update -yq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash \
    && apt-get install nodejs -yq \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# install typescript compiler globally
RUN npm install -g typescript

WORKDIR /app

EXPOSE 80
