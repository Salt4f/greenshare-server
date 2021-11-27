FROM debian:buster AS build-lib

RUN apt-get update -y && apt-get install curl tar build-essential pkg-config libglib2.0-dev libexpat1-dev libjpeg62-turbo-dev -y

RUN curl -fsSL https://github.com/libvips/libvips/releases/download/v8.11.4/vips-8.11.4.tar.gz -o vips.tar.gz

RUN tar xfz vips.tar.gz && \
    cd vips-8.11.4 && \
    ./configure && \
    make

FROM node:16

COPY --from=build-lib /vips-8.11.4 /vips-8.11.4
RUN cd vips-8.11.4 && make install
RUN rm -r vips-8.11.4/
RUN echo "/usr/local/lib" >> /etc/ld.so.conf.d/usrlocal.conf && \
    ldconfig -v

RUN mkdir /app
WORKDIR /app

ADD package-lock.json /app/package-lock.json
ADD package.json /app/package.json

RUN npm install
RUN mv /app/node_modules /node_modules

ADD . /app

EXPOSE 13000

CMD ["npm", "start"]