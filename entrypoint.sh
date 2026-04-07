#!/bin/sh
set -e

mkdir -p /app/data
echo "[startup] starting helpdesk dashboard..."
exec node server.js
