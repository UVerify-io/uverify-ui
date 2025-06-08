FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY config.js /config.js
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /config.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
EXPOSE 80