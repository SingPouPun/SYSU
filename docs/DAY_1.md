# Day 1｜第一步：认识骨架

今天先不碰后端。你需要认识以下五个位置：

1. `src/app/App.jsx`：全站状态与组件装配。
2. `src/components/loading/OpeningSequence.jsx`：完整启动动画。
3. `src/components/transitions/ChapterTransition.jsx`：每章短转场。
4. `src/config/animation.js`：统一时间和缓动参数。
5. `src/styles/tokens.css`：颜色、字体、粗描边与斜切变量。
6. `src/components/loading/SysuLionRunner.jsx`：启动和章节转场共用的中大狮。

## 我们即将亲手完成的第一项任务

给 `OpeningSequence` 中的四个方格和中大狮建立ref，用GSAP创建时间轴，使中大狮循环奔跑、方格依次砸入，并让旁边的“大山中学”清晰重排为“中山大学”。在开始写代码之前，先运行骨架并确认你能看到四格和右下角的中大狮动作槽。

```powershell
npm.cmd run dev
```

打开 `http://127.0.0.1:5173`。看到四个方格与右下角中大狮骨架后，不要继续写下一步，先告诉我画面是否正常以及你是否理解 `App → OpeningSequence → SysuLionRunner` 的调用关系。
