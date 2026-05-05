# Token Exporter

`cmd/token-exporter` exports rows from `tokens` to CSV, optionally uploads the CSV to Cloudflare R2, and sends the link to a Feishu bot.

## Run

```bash
go run ./cmd/token-exporter
```

For Docker Compose deployments, the image includes `/token-exporter`. Run the one-shot service:

```bash
docker compose --profile tools run --rm token-exporter
```

Use cron or your scheduler to run it once per day during off-peak hours.

```cron
0 3 * * * cd /path/to/new-api && docker compose --profile tools run --rm token-exporter >> logs/token-exporter.log 2>&1
```

Copy the example environment file to the repository root before running the Docker service:

```bash
cp new-api-token-export.env.example ./new-api-token-export.env
```

## Environment

Database:

- `SQL_DSN`: Same format as the application. Empty or `local` uses SQLite.
- `SQLITE_PATH`: SQLite database path when `SQL_DSN` is empty or `local`.
- The exporter automatically loads the project root `.env`, so you usually do not need to duplicate database settings if you run it from the repository directory.
- In `docker-compose.yml`, `token-exporter` receives the same PostgreSQL DSN pattern as `new-api`, so `./new-api-token-export.env` usually only needs export, R2, and Feishu settings.

Export:

- `TOKEN_EXPORT_OUTPUT_DIR`: CSV output directory. Default: `data/token-exports`.
- `TOKEN_EXPORT_DATE`: Export date used in the filename. Default: today, format `YYYY-MM-DD`.
- `TOKEN_EXPORT_BATCH_SIZE`: Rows per batch. Default: `1000`, max: `5000`.
- `TOKEN_EXPORT_BATCH_SLEEP_MS`: Sleep between batches. Default: `50`.
- `TOKEN_EXPORT_TIMEOUT_MINUTES`: Whole job timeout. Default: `30`.
- `TOKEN_EXPORT_WHERE`: Optional SQL condition appended to the query, for example `status = 1` or `accessed_time >= 1714492800`.

R2 upload:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_OBJECT_PREFIX`: Optional object prefix, for example `exports/tokens`.
- `R2_PUBLIC_BASE_URL`: Optional public/custom domain base URL. If empty, the notification uses the R2 S3 endpoint URL.

Feishu notification:

- `FEISHU_WEBHOOK_URL`: Feishu bot webhook URL.
- `FEISHU_KEYWORD`: Optional keyword prepended to the message if the bot enables keyword validation.

## Example

```bash
SQL_DSN='root:password@tcp(127.0.0.1:3306)/new-api' \
TOKEN_EXPORT_WHERE='status = 1' \
R2_ACCOUNT_ID='xxx' \
R2_ACCESS_KEY_ID='xxx' \
R2_SECRET_ACCESS_KEY='xxx' \
R2_BUCKET='exports' \
R2_OBJECT_PREFIX='daily/tokens' \
R2_PUBLIC_BASE_URL='https://files.example.com' \
FEISHU_WEBHOOK_URL='https://open.feishu.cn/open-apis/bot/v2/hook/xxx' \
go run ./cmd/token-exporter
```

Docker example:

```bash
docker compose --profile tools run --rm token-exporter
```

The exporter scans by `id > last_id order by id asc limit N`, so it avoids large `OFFSET` scans and only keeps one batch in memory.
