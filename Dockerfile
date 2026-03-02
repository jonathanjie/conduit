FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS dev
RUN npm ci
COPY . .
CMD ["npx", "tsx", "watch", "src/index.ts"]

FROM base AS prod
COPY dist/ ./dist/
CMD ["node", "dist/index.js"]
