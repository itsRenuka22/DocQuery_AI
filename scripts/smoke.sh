#!/usr/bin/env bash
set -euo pipefail

SESSION=$(uuidgen)
echo "[*] Ingesting sample.pdf"
curl -s -F "session_id=$SESSION" -F "files=@Profile.pdf" http://127.0.0.1:8000/ingest >/dev/null

echo "[*] Asking question"
curl -s -X POST http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d "{\"session_id\":\"$SESSION\",\"question\":\"Summarize the document\"}" | jq .

echo "[*] Check S3 prefix:"
aws s3 ls "s3://$S3_BUCKET/$SESSION/pdfs/"
