# =========================
# Development (local)
# =========================
FROM node:20-alpine3.18 AS development
WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat openssl1.1-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]