FROM node:12.8.0-alpine
WORKDIR /server
COPY ./package.json .
RUN npm install
COPY . .
EXPOSE 5000
CMD node api.js