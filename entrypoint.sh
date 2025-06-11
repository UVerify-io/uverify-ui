#!/bin/sh
node /config.js /usr/share/nginx/html
nginx -g 'daemon off;'