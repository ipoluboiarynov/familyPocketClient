FROM node:16.14.0-alpine
WORKDIR /app
COPY package*.json /app
RUN npm i
COPY . /app
# CMD ["npm", "run", "start-prod"]
RUN npm run build
EXPOSE 8080
CMD ["node", "server"]