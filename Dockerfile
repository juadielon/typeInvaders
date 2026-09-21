# syntax=docker/dockerfile:1

# ---- deps: install dependencies only (cached layer) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ---- dev: run the Vite dev server with hot reload ----
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- build: produce a production build ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---- prod: serve the production build with nginx ----
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
