#!/bin/bash
set -euo pipefail
TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "用法: bash 应用修复.command /Users/aran/Documents/GitHub/lxclash2"
  exit 1
fi
if [ ! -d "$TARGET/.git" ]; then
  echo "错误：目标目录不是 Git 仓库：$TARGET"
  exit 1
fi
cd "$(dirname "$0")"
rsync -av ./ "$TARGET/"
echo "已应用：LongXing v2.3 原生开关最终修复"
