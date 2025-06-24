# Base commands
FROM node:22-alpine AS base

WORKDIR /app

EXPOSE 3000

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# run in watch mode for development
FROM base AS development

CMD ["pnpm", "dev"]

# build for production
FROM base AS production

RUN pnpm build

CMD ["pnpm", "start"]
