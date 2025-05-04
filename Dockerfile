FROM node:14 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY config.sh /config.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /config.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
EXPOSE 80