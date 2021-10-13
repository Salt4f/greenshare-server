FROM node:16

RUN mkdir /app
WORKDIR /app

ADD package-lock.json /app/package-lock.json
ADD package.json /app/package.json
RUN npm install
RUN mv /app/node_modules /node_modules

ADD . /app

CMD ["node", "app.js"]