#!/usr/bin/env bash
# run-dev.sh — Start Vite dev server (binds to 127.0.0.1:5174)
set -e
cd "$(dirname "$0")"
exec npm run dev
