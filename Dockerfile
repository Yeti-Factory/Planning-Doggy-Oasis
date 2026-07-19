FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN test -n "$VITE_SUPABASE_URL" \
  && test -n "$VITE_SUPABASE_PUBLISHABLE_KEY" \
  && npm run build

FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Coolify's static-image wrapper copies /app into its own Nginx image.
# Keeping the same assets here preserves both Coolify and standalone Docker use.
COPY --from=build /app/dist /app

EXPOSE 80
