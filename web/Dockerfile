FROM node:alpine

ENV PORT 8000
EXPOSE 8000

RUN apk add docker git mariadb-client

WORKDIR /src/web

# Install

COPY package*.json ./
COPY . .
RUN npm ci

# Startup

ENTRYPOINT [ "npm", "start" ]
