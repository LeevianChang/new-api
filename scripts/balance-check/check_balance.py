#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
上游 new-api 钱包余额监控（聚合版）

遍历所有上游，调用 GET {base_url}/api/user/self 取 data.quota，按
quota_per_unit（和可选汇率）换算为显示金额，最后把所有上游结果合并成
**一张飞书卡片**发送：

  - 任一上游低于阈值 / 拉取失败 -> 红色告警卡片
  - 全部正常 -> 绿色正常卡片

用法:
  python3 check_balance.py --config config.yaml [--dry-run]
"""

import argparse
import sys
from datetime import datetime

import requests
import yaml

DEFAULT_TIMEOUT = 15
DEFAULT_QUOTA_PER_UNIT = 500000.0


def fetch_quota(upstream):
    base_url = upstream["base_url"].rstrip("/")
    url = f"{base_url}/api/user/self"
    headers = {
        "Authorization": upstream["access_token"],
        "New-Api-User": str(upstream["user_id"]),
    }
    resp = requests.get(url, headers=headers, timeout=upstream.get("timeout", DEFAULT_TIMEOUT))
    resp.raise_for_status()
    body = resp.json()
    if not body.get("success"):
        raise RuntimeError(f"接口返回 success=false: {body.get('message')}")
    data = body.get("data") or {}
    if "quota" not in data:
        raise RuntimeError(f"响应缺少 data.quota 字段: {body}")
    return int(data["quota"])


def quota_to_display(quota, upstream):
    qpu = float(upstream.get("quota_per_unit", DEFAULT_QUOTA_PER_UNIT))
    rate = float(upstream.get("exchange_rate", 1.0))
    return quota / qpu * rate


def check_one(upstream):
    """返回 dict: {name, base_url, unit, threshold, quota, display, status, error}"""
    name = upstream.get("name") or upstream["base_url"]
    unit = upstream.get("unit", "$")
    threshold = float(upstream["threshold"])
    item = {
        "name": name,
        "base_url": upstream["base_url"],
        "unit": unit,
        "threshold": threshold,
        "quota": None,
        "display": None,
        "status": "ok",   # ok | low | error
        "error": None,
    }
    try:
        quota = fetch_quota(upstream)
    except Exception as e:
        item["status"] = "error"
        item["error"] = str(e)
        return item

    display = quota_to_display(quota, upstream)
    item["quota"] = quota
    item["display"] = display
    item["status"] = "low" if display < threshold else "ok"
    return item


STATUS_ICON = {"ok": "✅", "low": "🚨", "error": "⚠️"}
STATUS_TEXT = {"ok": "正常", "low": "低额", "error": "异常"}


def build_aggregate_card(items):
    has_alert = any(it["status"] != "ok" for it in items)
    low_cnt = sum(1 for it in items if it["status"] == "low")
    err_cnt = sum(1 for it in items if it["status"] == "error")
    ok_cnt = sum(1 for it in items if it["status"] == "ok")

    if has_alert:
        template = "red"
        title = f"🚨 上游余额告警（低额 {low_cnt} · 异常 {err_cnt} · 正常 {ok_cnt}）"
        summary = f"**🚨 存在需要关注的上游，请尽快处理。**"
    else:
        template = "green"
        title = f"✅ 上游余额正常（共 {ok_cnt} 个）"
        summary = "全部上游余额充足，无需操作。"

    elements = [
        {"tag": "div", "text": {"tag": "lark_md", "content": summary}},
        {"tag": "hr"},
    ]

    for it in items:
        icon = STATUS_ICON[it["status"]]
        stxt = STATUS_TEXT[it["status"]]
        header_line = f"**{icon} {it['name']}** · {stxt}"
        if it["status"] == "error":
            body = (
                f"{header_line}\n"
                f"拉取失败: `{it['error']}`\n"
                f"地址: [{it['base_url']}]({it['base_url']})"
            )
        else:
            body = (
                f"{header_line}\n"
                f"余额 **{it['display']:.4f} {it['unit']}** / 阈值 {it['threshold']:.4f} {it['unit']}　"
                f"（quota={it['quota']}）\n"
                f"地址: [{it['base_url']}]({it['base_url']})"
            )
        elements.append({"tag": "div", "text": {"tag": "lark_md", "content": body}})

    elements.append({
        "tag": "note",
        "elements": [{"tag": "lark_md",
                      "content": f"检查时间 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"}],
    })

    return {
        "config": {"wide_screen_mode": True},
        "header": {
            "template": template,
            "title": {"tag": "plain_text", "content": title},
        },
        "elements": elements,
    }


def send_feishu_card(webhook, card):
    payload = {"msg_type": "interactive", "card": card}
    r = requests.post(webhook, json=payload, timeout=10)
    r.raise_for_status()
    j = r.json()
    if j.get("code", j.get("StatusCode", -1)) not in (0,):
        raise RuntimeError(f"飞书返回异常: {j}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="YAML 配置文件路径")
    parser.add_argument("--dry-run", action="store_true", help="只打印不发送")
    args = parser.parse_args()

    with open(args.config, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f) or {}

    webhook = cfg.get("feishu_webhook", "")
    upstreams = cfg.get("upstreams") or []
    if not upstreams:
        print("[ERROR] 配置中没有 upstreams", file=sys.stderr)
        sys.exit(1)
    if not webhook and not args.dry_run:
        print("[ERROR] 顶层未配置 feishu_webhook", file=sys.stderr)
        sys.exit(1)

    items = []
    for up in upstreams:
        it = check_one(up)
        items.append(it)
        if it["status"] == "error":
            print(f"[ERROR] [{it['name']}] {it['error']}", file=sys.stderr)
        else:
            tag = "LOW" if it["status"] == "low" else "OK"
            print(f"[{tag}] [{it['name']}] quota={it['quota']} "
                  f"display={it['display']:.4f}{it['unit']} "
                  f"threshold={it['threshold']}{it['unit']}")

    card = build_aggregate_card(items)

    if args.dry_run:
        import json as _json
        print("[DRY-RUN] 聚合卡片预览:")
        print(_json.dumps(card, ensure_ascii=False, indent=2))
        return

    try:
        send_feishu_card(webhook, card)
        print(f"[INFO] 已发送聚合飞书卡片，共 {len(items)} 个上游")
    except Exception as e:
        print(f"[ERROR] 飞书发送失败: {e}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
