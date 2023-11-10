FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --omit=dev

COPY . .

CMD ["index.js"]
