FROM node:12.18-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ./package.json ./

RUN npm install --production --silent

COPY server server
COPY lib lib

EXPOSE 8080
CMD [ "node", "server/bin/www" ]
