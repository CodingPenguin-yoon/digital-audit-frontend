FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY index.html vite.config.mjs ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts
COPY worker ./worker
COPY .openai ./.openai
RUN npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
