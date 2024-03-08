FROM node:latest

WORKDIR /src

COPY ./AsteroidMiningREST/package.json /src

RUN mkdir /src/node_modules

WORKDIR /src

RUN npm install

# Add nodemon for autoreloading js scripts
RUN npm install nodemon -g

CMD ["nodemon", "main.js"] 
