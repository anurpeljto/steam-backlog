FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
