FROM node:16-alpine
WORKDIR /app
COPY package*.json /app
RUN npm i
COPY . /app
RUN npm run build
EXPOSE 8080
CMD ["node", "server"]