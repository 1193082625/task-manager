FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

ARG VITE_MONITOR_ENDPOINT
ARG VITE_MONITOR_APP_KEY
ARG VITE_MONITOR_APP_ID
ARG VITE_MONITOR_APP_VERSION
ARG VITE_MONITOR_SAMPLE_RATE

ENV VITE_MONITOR_ENDPOINT=$VITE_MONITOR_ENDPOINT \
    VITE_MONITOR_APP_KEY=$VITE_MONITOR_APP_KEY \
    VITE_MONITOR_APP_ID=$VITE_MONITOR_APP_ID \
    VITE_MONITOR_APP_VERSION=$VITE_MONITOR_APP_VERSION \
    VITE_MONITOR_SAMPLE_RATE=$VITE_MONITOR_SAMPLE_RATE

COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]