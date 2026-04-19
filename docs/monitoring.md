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

## 1.1 域名入口（Caddy + 雷池）

已集成 Caddy 作为内网反向代理，监听 `127.0.0.1:8080`（纯 HTTP），将三个域名分别反代到应用和监控组件：

- `API_DOMAIN` -> `new-api:3000`
- `GRAFANA_DOMAIN` -> `grafana:3000`
- `PROMETHEUS_DOMAIN` -> `prometheus:9090`

配置项见 `.env.example` 中的 Caddy 部分。

**拓扑架构（雷池在前）：**

```
公网 HTTPS (443)
    ↓
雷池 (SafeLine) — 负责 SSL 证书、WAF 防护
    ↓ HTTP
Caddy (127.0.0.1:8080) — 基于 Host 头分发到不同服务
    ↓
new-api / grafana / prometheus
```

**雷池配置要点：**

1. 在雷池中配置三个上游站点，分别指向：
   - `api.yourdomain.com` -> `http://caddy:8080`（需加入 `safeline-ce` 网络）
   - `grafana.yourdomain.com` -> `http://caddy:8080`
   - `prom.yourdomain.com` -> `http://caddy:8080`

2. 雷池负责 HTTPS 证书申请和续期，回源到 Caddy 使用 HTTP 即可。

3. Caddy 根据 `Host` 头将请求分发到对应的后端服务。

注意：Caddy 已配置为纯内网模式，不处理证书，不会与雷池的 `80/443` 端口冲突。

## 2. 应用指标接口

应用新增 `GET /metrics`（Prometheus 拉取）。

- 如未设置 `METRICS_TOKEN`：默认允许内网访问
- 如设置了 `METRICS_TOKEN`：需要携带以下任一方式
  - `Authorization: Bearer <token>`
  - `X-Metrics-Token: <token>`
  - `?token=<token>`

## 3. 关键指标

- `newapi_http_requests_total`
- `newapi_http_request_duration_seconds`
- `newapi_relay_requests_total`
- `newapi_relay_request_duration_seconds`
- `newapi_relay_errors_total`
- `newapi_dependency_up{dependency="database|redis"}`
- `newapi_db_connections`
- `newapi_redis_pool_connections`
- `probe_success`（blackbox 下游探测）

## 4. 下游探测目标

编辑 `monitoring/prometheus/downstream_targets.yml`，按 `host:port` 增加或删除目标。

变更后 Prometheus 会自动刷新，无需重启。
