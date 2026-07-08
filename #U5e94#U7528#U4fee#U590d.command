#!/bin/bash
set -euo pipefail
TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "用法: bash 应用修复.command /你的仓库路径"
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
rsync -av --exclude '应用修复.command' --exclude 'README_覆盖说明.txt' "$SCRIPT_DIR/" "$TARGET/"
cd "$TARGET"
for f in \
  src/native/sysproxy/package.json \
  src/native/sysproxy/index.js \
  src/native/sysproxy/index.d.ts \
  scripts/prepare.mjs \
  scripts/install-git-hooks.mjs \
  electron.vite.config.ts \
  src/main/index.ts \
  src/preload/index.ts \
  src/shared/types.d.ts \
  src/renderer/src/App.tsx; do
  test -f "$f" || { echo "缺少文件: $f"; exit 1; }
done
echo "修复合并完成，关键文件检查全部通过。"
