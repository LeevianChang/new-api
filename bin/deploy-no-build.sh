#!/usr/bin/env bash
set -euo pipefail

echo "[deploy] pulling image..."
docker compose pull new-api

echo "[deploy] starting core services without build..."
docker compose up -d --no-build feishu-bridge alertmanager prometheus new-api

echo "[deploy] current status:"
docker compose ps feishu-bridge alertmanager prometheus new-api
