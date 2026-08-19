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

## 管理员数据库页面

先在项目目录创建或升级一个本地管理员账号：

```powershell
.venv\bin\python.exe -m flask --app backend.app create-admin sysuadmin
```

命令行会要求输入并确认至少 8 位的密码，密码不会写进源码。随后保持 Flask 与 Vite 都在运行，访问：

`http://127.0.0.1:5173/admin`

使用刚创建的管理员账号登录后，数据库可视化面板会自动打开。生产构建模式则访问 `http://127.0.0.1:5000/admin`。普通账号访问 `/api/dashboard` 会返回 403，无权读取数据库。

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
# 正式上线（GitHub + Render）

GitHub Pages 只能托管静态前端，不能运行本项目的 Flask、Session 与 SQLite。正式展示采用：

- GitHub：保存源码与自动部署来源
- Render Web Service：从仓库根目录的 `Dockerfile` 构建 React，再由 Flask/Gunicorn 提供整站
- 主站：`https://你的服务名.onrender.com/`
- 独立管理页：`https://你的服务名.onrender.com/admin`

在 Render 选择仓库后使用根目录的 `render.yaml` 创建 Blueprint。首次部署时填写：

- `SYSU_BOOTSTRAP_ADMIN_USER`：管理员用户名
- `SYSU_BOOTSTRAP_ADMIN_PASSWORD`：至少 8 位的管理员密码

管理员首次创建成功后，可在 Render 环境变量中删除上述两个初始化变量。数据库位于持久化磁盘 `/app/storage/sysu.db`，不会因普通重新部署而丢失。

管理员在主站登录后，主站标签页会保留，并自动打开独立的 `/admin` 标签页。浏览器若拦截弹窗，可点击顶部数据库图标重新打开。
