FROM node:lts-alpine

RUN apk add git php7 zip bash curl

RUN npm install -g npm@latest
RUN npm cache verify

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV NO_CHECKS=1

WORKDIR /src

ENTRYPOINT [ "npm", "run", "build:plugin-zip" ]
