#!/usr/bin/env bash
set -e

docker compose up -d

bun run db:push

cleanup() {
  docker compose down
}

trap cleanup EXIT INT TERM

bun run dev:app
