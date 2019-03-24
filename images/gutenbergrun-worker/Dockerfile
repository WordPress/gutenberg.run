FROM alpine

RUN apk add nodejs-npm git php7 zip bash curl

RUN npm install -g npm@latest

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

COPY ./bundle-plugin.sh /usr/bin/bundle-plugin
RUN chmod +x /usr/bin/bundle-plugin

WORKDIR /src

ENTRYPOINT [ "bundle-plugin" ]
