FROM node:12.18-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json ./

RUN npm install --production --silent

COPY server server
COPY lib /usr/src/app/lib

EXPOSE 3000
CMD [ "node", "server/bin/www" ]
