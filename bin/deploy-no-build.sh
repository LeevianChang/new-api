#!/usr/bin/env bash
set -euo pipefail

echo "[deploy] pulling image..."
docker compose pull new-api

echo "[deploy] starting new-api without build..."
docker compose up -d --no-build new-api

echo "[deploy] current status:"
docker compose ps new-api
