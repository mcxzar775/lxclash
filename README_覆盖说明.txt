龙行科技 v2.3 使用引导 TypeScript 修复

修复错误：
Module '"@renderer/App"' has no exported member 'getDriver'

修改：
1. settings/actions.tsx 改为从 @renderer/utils/tour 导入 getDriver
2. App.tsx 初始化 createTourDriver，并载入 driver.js 样式

请把 src 文件夹合并复制到仓库根目录，不要删除其他目录。
