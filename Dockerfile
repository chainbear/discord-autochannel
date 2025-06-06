FROM node:23-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --omit=dev

COPY . .

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
