#!/usr/bin/env bash
set -euo pipefail

echo "[deploy] pulling image..."
docker compose pull new-api

echo "[deploy] starting core services without build..."
docker compose up -d --no-build \
  feishu-bridge alertmanager prometheus grafana \
  redis-exporter postgres-exporter node-exporter cadvisor blackbox-exporter \
  new-api

echo "[deploy] current status:"
docker compose ps \
  feishu-bridge alertmanager prometheus grafana \
  redis-exporter postgres-exporter node-exporter cadvisor blackbox-exporter \
  new-api
