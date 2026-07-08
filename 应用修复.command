#!/bin/bash
set -e
TARGET="${1:-$(pwd)}"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$TARGET/src/renderer/src/locales"
rsync -av "$SOURCE_DIR/src/renderer/src/locales/" "$TARGET/src/renderer/src/locales/"
echo "语言文件已恢复到：$TARGET/src/renderer/src/locales"
