FROM alpine

RUN apk add nodejs-npm git php7 zip bash curl

RUN npm install -g npm@latest
RUN npm verify

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV NO_CHECKS=1

WORKDIR /src

ENTRYPOINT [ "npm", "run", "package-plugin" ]
