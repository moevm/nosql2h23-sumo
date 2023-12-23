FROM ubuntu:22.04

RUN apt-get update && \
  apt-get install -y curl && \
  curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
  apt-get install -y nodejs

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY wait-for-it.sh ./wait-for-it.sh

RUN chmod +x ./wait-for-it.sh

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
