FROM node:11
WORKDIR /usr/src/app

RUN mkdir front
RUN mkdir back

COPY front/package*.json front/
COPY back/package*.json back/

WORKDIR /usr/src/app/front

RUN npm install

WORKDIR /usr/src/app/back

RUN npm install

WORKDIR /usr/src/app

COPY front front
COPY back back

WORKDIR /usr/src/app/front

RUN npm run build

WORKDIR /usr/src/app/back

RUN npm run build

EXPOSE 8081

ENV OGRA_PWD orga

CMD node dist/index.js
