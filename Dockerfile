FROM node:12-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY database ./database
COPY externalAPI ./externalAPI
COPY models ./models
COPY middlewares ./middlewares
COPY utils ./utils
COPY index.js .
COPY db.js .
COPY server.js .
COPY products.js .
COPY categories.js .

EXPOSE 5000


CMD npm start
