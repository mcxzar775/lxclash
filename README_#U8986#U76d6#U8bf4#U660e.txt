龙行科技 v2.2 全量合并修复包 v4

本包合并了：
1. src/native/sysproxy 本地依赖
2. scripts/prepare.mjs 与 install-git-hooks.mjs
3. shared/preload 类型声明
4. 完整 renderer 关键文件与授权入口
5. 完整 main/preload 源码
6. electron.vite.config.ts 主进程、preload、renderer 入口修复

重要：不要在 Finder 中“替换整个 src 文件夹”。请用脚本以 rsync 合并：

bash "$HOME/Downloads/longxing-v2.2-allfix-overlay-v4/应用修复.command" "/Users/aran/Documents/GitHub/lxclash"

然后：
cd /Users/aran/Documents/GitHub/lxclash
git add -A
git status
git commit -m "Apply LongXing v2.2 all fixes v4"
git push

在 GitHub Code 页面确认存在：
src/native/sysproxy/package.json
src/main/index.ts
src/preload/index.ts
electron.vite.config.ts
