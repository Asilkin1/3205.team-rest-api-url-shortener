# install linux
FROM node:18-alpine

# workdir
WORKDIR /app

# copy files
COPY package*.json ./

# install npm
RUN npm install

# copy project files
COPY . .

# expose port
EXPOSE 3000

# run app
CMD [ "node", "server.js" ]