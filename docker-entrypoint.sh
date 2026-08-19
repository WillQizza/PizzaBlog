#!/bin/sh
set -e

cd /migrate
./node_modules/.bin/prisma migrate deploy

cd /app
exec node server.js
