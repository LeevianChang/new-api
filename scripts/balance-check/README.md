# 上游 new-api 余额监控

定时调用上游 `GET /api/user/self` 拉取**钱包 quota**，每次执行都通过飞书机器人发送一张卡片：

- 余额 ≥ 阈值：绿色「正常」卡片
- 余额 < 阈值：红色「告警」卡片

## 为什么是独立脚本而非内嵌

- 与主程序解耦，升级合并上游不冲突
- 只读操作，挂掉不影响 API 服务
- 多上游天然支持，每家阈值/兑换比独立

## 安装

```bash
pip3 install pyyaml requests
cp config.example.yaml config.yaml
vim config.yaml
```

## 字段说明

| 字段 | 说明 |
|---|---|
| `base_url` | 上游 new-api 根地址 |
| `access_token` | 上游「个人设置 → 系统访问令牌」生成的 token |
| `user_id` | 上游你的用户 ID（个人设置页可见） |
| `quota_per_unit` | 上游 `.env` 的 `QUOTA_PER_UNIT`，默认 500000 |
| `exchange_rate` | 若上游用 CNY 显示，填汇率（如 7.3）；USD 站留 1 |
| `unit` | 仅用于消息展示 |
| `threshold` | 阈值，单位与 `unit` 一致 |

换算公式：`display = quota / quota_per_unit * exchange_rate`

> 阈值直接按上游页面看到的数字填即可。

## 使用

```bash
# 试跑（打印卡片 JSON，不发消息）
python3 check_balance.py --config config.yaml --dry-run

# 正式跑一次
python3 check_balance.py --config config.yaml
```

## crontab（每 30 分钟）

```cron
*/30 * * * * /usr/bin/env python3 /absolute/path/check_balance.py --config /absolute/path/config.yaml >> /tmp/newapi_balance.log 2>&1
```

## 行为

- 每次运行都会对每个上游发送一张飞书卡片（正常=绿色，低额=红色）
- 拉取失败仅打印 stderr，不阻塞其他上游，也不发卡片
