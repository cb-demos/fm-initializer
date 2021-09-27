FROM node:14-alpine as BUILDER
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
RUN pnpm install
COPY . .
CMD ["pnpm", "start"]
