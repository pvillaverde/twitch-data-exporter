FROM node:15-alpine
MAINTAINER Pablo Villaverde <https://github.com/pvillaverde>
## Install App dependencies
## Using wildcard to copy both package.json and package-lock.json
## This forces Docker not to use cache when we change our dependencies
ADD package*.json /tmp/
RUN cd /tmp && npm install
RUN mkdir -p /opt/twitch-data-exporter && cp -a /tmp/node_modules /opt/app
## Now we copy our App source code, having the dependencies previously cached if possible.
WORKDIR /opt/twitch-data-exporter
ADD . /opt/twitch-data-exporter

CMD [ "node", "app/index.js" ]