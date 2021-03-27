FROM node:14-alpine
WORKDIR /var
RUN apk update && apk add git
RUN git clone https://github.com/Augustalex/agge-dev.git
WORKDIR /var/agge-dev/test
RUN npm install
CMD node ./test_server.js
