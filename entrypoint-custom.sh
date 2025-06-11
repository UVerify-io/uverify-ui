#!/bin/sh
cd /app
npm run build

rm -rf /usr/share/nginx/html/*
cp -r /app/dist/* /usr/share/nginx/html/

nginx -g 'daemon off;'