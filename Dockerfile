FROM node:11
WORKDIR /usr/src/app

RUN su -c 'npm install -g @vue/cli @vue/cli-service-global'
RUN vue --version

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
COPY orga orga
COPY start.sh start.sh
COPY build_tournois.sh build_tournois.sh

WORKDIR /usr/src/app/front

RUN npm run build

WORKDIR /usr/src/app/back

RUN npm run build

WORKDIR /usr/src/app

EXPOSE 8080

ENV OGRA_PWD orga
ENV TOURNOIS lille,lyon,nancy,paris-1,paris-2,rennes,toulouse,tours

RUN ./build_tournois.sh
RUN ls -lah

COPY dispatcher dispatcher
WORKDIR /usr/src/app/dispatcher

RUN npm install

WORKDIR /usr/src/app

CMD ./start.sh
