#!/bin/bash
set -euo pipefail
TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "用法: bash 应用修复.command /path/to/lxclash2"
  exit 1
fi
cd "$(dirname "$0")"
mkdir -p "$TARGET/.github/workflows"
rsync -av .github/workflows/build-windows-x64.yml "$TARGET/.github/workflows/build-windows-x64.yml"
echo "Windows x64 workflow 已写入: $TARGET/.github/workflows/build-windows-x64.yml"
