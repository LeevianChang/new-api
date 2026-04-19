# Prometheus + Grafana 监控

本项目已内置 Prometheus 指标与 Grafana 监控栈，覆盖：

- API QPS、耗时、错误率
- Relay 下游请求量、下游错误率、按 channel_type 的延迟
- Redis / 数据库健康状态与连接池
- 机器与容器指标（node-exporter + cAdvisor）
- 外部下游连通性探测（blackbox-exporter）

## 1. 启动

```bash
docker compose up -d
```

访问地址：

- Grafana: `http://127.0.0.1:3001`
- Prometheus: `http://127.0.0.1:9090`

默认仪表盘：`New API / New API Overview`

## 2. 域名访问配置

如需通过域名访问监控服务，建议在雷池（SafeLine）或其他反向代理中配置：

- Grafana: 直接代理到 `http://grafana:3000`
- Prometheus: 直接代理到 `http://prometheus:9090`
- New API: 直接代理到 `http://new-api:3000`

注意：监控服务默认只监听 `127.0.0.1`，需要通过 Docker 网络访问。

## 3. 应用指标接口

应用新增 `GET /metrics`（Prometheus 拉取）。

- 如未设置 `METRICS_TOKEN`：默认允许内网访问
- 如设置了 `METRICS_TOKEN`：需要携带以下任一方式
  - `Authorization: Bearer <token>`
  - `X-Metrics-Token: <token>`
  - `?token=<token>`

## 4. 关键指标

- `newapi_http_requests_total`
- `newapi_http_request_duration_seconds`
- `newapi_relay_requests_total`
- `newapi_relay_request_duration_seconds`
- `newapi_relay_errors_total`
- `newapi_dependency_up{dependency="database|redis"}`
- `newapi_db_connections`
- `newapi_redis_pool_connections`
- `probe_success`（blackbox 下游探测）

## 5. 下游探测目标

编辑 `monitoring/prometheus/downstream_targets.yml`，按 `host:port` 增加或删除目标。

变更后 Prometheus 会自动刷新，无需重启。
