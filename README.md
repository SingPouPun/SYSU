# 中山大学 SYSU 沉浸式网站

一个以中山大学历史、文化、学科、校园和寄语为主题的 React + Flask 练习项目。视觉采用高对比、斜切卡片、粗描边、扫描线和故障转场，并融入中大绿、海棠窗、红砖绿瓦与校训元素。

## 第一次运行

需要 Node.js 18+ 与 Python 3.10+。

```powershell
python -m venv .venv
.venv\bin\python.exe -m pip install -r requirements.txt
npm.cmd install
```

打开两个 PowerShell 窗口：

```powershell
# 窗口一：Flask API
.venv\bin\python.exe -m backend.app
```

```powershell
# 窗口二：React 页面
npm.cmd run dev
```

浏览器访问 `http://127.0.0.1:5173`。

## 准备第 40 条演示寄语

```powershell
.venv\bin\python.exe -m backend.seed
```

脚本会补齐 39 条标有“演示寄语”的数据。随后在网页注册新账号并投稿，即可触发第 40 条聚徽动画。脚本可以安全重复运行。

## 单地址生产演示

```powershell
npm.cmd run build
.venv\bin\python.exe -m backend.app
```

访问 `http://127.0.0.1:5000`。Flask 会同时提供 API 和构建后的 React 页面。

## 修改诗歌

只需编辑根目录的 `poem.config.json`：

- `title`：诗题
- `lines`：诗句数组
- `signature`：落款

保存后开发页面会自动更新；生产演示需重新执行 `npm.cmd run build`。

## 探索礼包条件

依次完成以下交互：点击历史年份、翻开校训卡、切换学科分类、切换校园频道、点击一条寄语。进度保存在浏览器本地。如果要重新体验，可在浏览器开发者工具中清除本站 Local Storage 和 Session Storage。

## 测试

```powershell
.venv\bin\python.exe -m unittest backend.test_app
npm.cmd run build
```

## 内容来源

介绍内容依据中山大学官方网站的学校概况、校园文化、学科优势和中大校区页面整理。项目未使用《绝区零》的角色、Logo、专有字体、音频、美术文件或源代码。
