### Stage 1 — bygg React-frontend
FROM node:20-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

### Stage 2 — produktionsimage
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY --from=build-client /app/client/dist ./public/

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/youmewe.db

EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "src/server.js"]
