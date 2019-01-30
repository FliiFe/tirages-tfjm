FROM node:11
WORKDIR /usr/src/app

COPY front front
COPY back back

WORKDIR front

RUN npm install
RUN npm run build

WORKDIR ../back

RUN npm install
RUN npm run build

EXPOSE 8081

CMD node dist/index.js
