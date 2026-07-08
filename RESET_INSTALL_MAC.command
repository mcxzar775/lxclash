#!/bin/bash
set -euo pipefail
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${1:-$HOME/Documents/GitHub/lxclash}"
if [ ! -d "$TARGET_DIR/.git" ]; then
  echo "错误：目标目录不是 Git 仓库：$TARGET_DIR"
  exit 1
fi
cd "$TARGET_DIR"
echo "正在清理旧工作区（保留 .git）..."
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
echo "正在复制 v2.3 完整源码..."
rsync -a --exclude '.git' --exclude 'RESET_INSTALL_MAC.command' "$SOURCE_DIR/" "$TARGET_DIR/"
echo "检查核心文件..."
for f in src/main/index.ts src/preload/index.ts src/renderer/src/main.tsx src/native/sysproxy/package.json src/shared/appConfig.ts scripts/prepare.mjs electron.vite.config.ts package.json; do
  test -f "$f" || { echo "缺少：$f"; exit 1; }
done
echo "完整源码恢复成功。"
echo "接下来执行：git add -A && git commit -m 'Reset to complete LongXing v2.3 source' && git push"
