## 1、 中山大学 SYSU 网站

大作业究竟做些什么呢，思来想去，最终决定做一个介绍中大的网页，对于网页的设计风格来说，我觉得明日方舟的那种科幻工业风，以及绝区零那种漫画风是能让人眼前一新的。起初打算做个学长在第一天展示的那种灵动的，点击一下便能散开，如花绽放般的互动式网页，同时结合明日方舟的科幻风格，以展现群星闪烁之感，但的确那种散开灵动的设计是极难的，更何况起初内容亦不清楚究竟应该展现中大的什么，便转换方向了。因此最终打算做一个绝区零风格的互动网页，或许如花绽放般的互动尚未可实现，但是灵动，群星闪烁般的效果却不愿不留。因此，网站的每一个按钮以及过渡动画我都要呈现出来灵动之感，算是实现七八成吧。最终确定网页的内容涵盖中大的历史，校园文化，学科设置 ，校园景色以及最后的寄语部分。历史部分是卡牌展示，初现八张卡，介绍1924至2024的中大重要时间点，八张卡都阅读过之后便会呈现新章，算是未来由我们书写之意。校园文化部分其实是整个网页最后设计的，起初打算边学UE5边做那种鼠标滑动，徐徐前行之感，但受限于我在这方面是零基础，时间亦有限，故只能用GSAP大致呈现了，因此这一部分其实做的十分简陋。学科设置部分的话则是一个月相图，本是文理医工农，但现在融合学科已是欣欣向荣之势，我也相信融合交叉学科定是未来的方向，便加上了“融”，至于选择月相图的原因，便是月亮有盈缺，学科亦有“盛衰”，这一点，医学大致是可以感受到的，我十分喜欢群星，因此在点击进去之后便是学院绕着大类旋转的感觉。至于景色部分便是档案的样子，五校园，除了北校以外，都添加了一些我拍的照片以及网上找来的照片，当然拍的极其漂亮的照片大概率都是网上找的，右下角有水印的。最后寄语部分的话，既然夏令营同学是来自五湖四海的，就算是都是中大的，亦来自不同学院，便做成一个祖国地图，写上寄语，汇聚到深圳校区之感，寄语进度条达到百分百后，点击便会呈现粒子汇聚成深圳校区，中大生医工卓工协会的徽标，以及中山大学的校徽，是打算呈现群星闪烁之感，不过究竟有无，可能都要发挥一些想象了。最后便是我写的一首小诗作为结尾：“一叶辞柯一岁秋，桂香入袖几回眸。欲把心事裁成句，只恐言轻负此秋。” 最后两句算是改了又改，最后还是把自己的心路历程写下为好，其中蕴意，或许不同读者，不同心境亦有不同体会。我作为预防本科，十分羡慕中大生医工的同学，羡慕网页可视化与深度学习，亦羡慕一个个想法最终落成一块块真正的硬件。也第一次在生医工中感到了何为大学。第一天许多导生同学的自我展示，可以说是群英荟萃了，既让我内心感到无比钦佩，亦有无穷之愧疚，究竟我大学两年内学到了什么，大学两年又在我心中留下了什么。十分感谢这次生医工的暑期训练营的机会，悟已往之不可谏，知来者之犹可追，本科后面的三年，我应该做什么，怎么做，怎么做好，亦有了更深的体会。



## 2. 技术栈

| 层级     | 技术                         | 主要作用                                   |
| -------- | ---------------------------- | ------------------------------------------ |
| 前端框架 | React、React DOM             | 组件渲染、状态管理和交互更新               |
| 构建工具 | Vite、`@vitejs/plugin-react` | 启动开发服务器、转换 JSX、热更新和生产打包 |
| 动画     | GSAP、ScrollTrigger          | 开场、按钮反馈、章节转场和滚动动画         |
| 页面表现 | CSS、SVG、Canvas 2D          | 布局、响应式、矢量图形和月相绘制           |
| 数据通信 | Fetch API                    | 请求 Flask API 和静态 JSON 数据            |
| 本地存储 | localStorage                 | 保存章节访问记录和互动进度                 |
| 后端     | Flask                        | 提供认证、寄语及管理员数据库接口           |

> 项目依赖中保留了 Three.js、React Three Fiber、Drei 和 OGL，源码中也保留了早期实验组件；但这些组件没有进入当前页面的入口引用链，因此不属于最终展示页面的实际运行架构。

## 3. 目录结构

```text
SYSU/
├─ api/                         # Vercel 环境的 Flask API 入口
├─ backend/                     # Flask 后端、数据初始化和后端测试
├─ public/                      # 图片、地图 JSON 等静态资源
├─ src/
│  ├─ main.jsx                 # 前端入口：加载全局 CSS，将 App 挂载到 #root
│  ├─ app/
│  │  └─ App.jsx               # 根组件：管理页面状态、导航、转场、登录和弹窗
│  ├─ components/
│  │  ├─ layout/               # 全站共用布局：顶部导航、章节进度条
│  │  ├─ loading/              # 开场加载动画
│  │  ├─ transitions/          # 页面与章节转场
│  │  ├─ books/                # CD 档案书库
│  │  ├─ history/              # 历史章节交互组件
│  │  ├─ culture/              # 文化章节、海棠窗和歌词组件
│  │  ├─ disciplines/          # 学科图谱及遗留的三维轨道实验组件
│  │  ├─ campuses/             # 校园档案组件
│  │  ├─ messages/             # 中国地图、寄语和聚徽动画
│  │  ├─ auth/                 # 登录与注册弹窗
│  │  ├─ share/                # 分享弹窗
│  │  ├─ poem/                 # 诗歌入口和诗歌礼物
│  │  └─ database/             # 管理员数据库界面
│  ├─ sections/                # 五个主章节的页面级组件
│  ├─ data/                    # 章节、学科和演示数据
│  ├─ config/                  # 运行模式与动画配置
│  ├─ utils/                   # 互动进度读写工具
│  └─ styles/
│     ├─ reset.css             # 清除浏览器默认样式差异
│     ├─ tokens.css            # 全站颜色、字体、尺寸等设计变量
│     └─ scaffold.css          # 页面主体、组件、动画和响应式样式
├─ vite.config.js              # Vite、React 插件、API 代理和构建目录配置
├─ package.json                # 前端依赖和运行命令
├─ requirements.txt            # Python 后端依赖
├─ render.yaml                 # Render 部署配置
└─ vercel.json                 # Vercel 部署配置
```

## 4. 前端启动与渲染流程

```text
浏览器加载 HTML
       ↓
Vite 加载 src/main.jsx
       ↓
main.jsx 加载三个全局 CSS
       ↓
React createRoot 找到 #root
       ↓
渲染 App 组件
       ↓
App 根据 URL 选择管理员界面或主站
       ↓
MainExperience 根据 activePage 渲染当前章节
```

`main.jsx` 是前端入口。它统一加载重置样式、设计变量和主样式，再把 `App` 挂载到 HTML 的 `#root` 容器：

```jsx
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 5. 根组件与页面状态

`App.jsx` 是前端控制中心。普通地址显示 `MainExperience`，访问 `/admin` 时显示 `AdminPortal`：

```jsx
export default function App() {
  return window.location.pathname === '/admin'
    ? <AdminPortal />
    : <MainExperience />
}
```

主站没有使用 React Router，而是通过 `activePage` 状态决定当前显示的页面：

```jsx
const [activePage, setActivePage] = useState('top')
```

用户点击导航后调用 `setActivePage(...)`。React 检测到状态变化，会重新执行相关组件函数，计算新的 JSX，并只把实际变化更新到 DOM。

主要页面状态包括：

| 状态                          | 作用                             |
| ----------------------------- | -------------------------------- |
| `activePage`                  | 决定当前显示首页、档案或某一章节 |
| `activeChapter`               | 控制顶部导航的章节高亮           |
| `openingVisible`              | 控制开场动画是否显示             |
| `transition`、`cdTransition`  | 控制不同类型的章节转场           |
| `user`                        | 保存当前登录用户信息             |
| `authVisible`、`shareVisible` | 控制登录和分享弹窗               |
| `poemVisible`                 | 控制诗歌礼物界面                 |

## 6. 组件层级

```text
App
├─ AdminPortal                         # /admin
└─ MainExperience                     # 主站
   ├─ OpeningSequence                 # 开场动画
   ├─ ChapterTransition               # 常规章节转场
   ├─ CdChapterTransition             # CD 档案转场
   ├─ SiteHeader                      # 顶部全站导航
   ├─ ProgressRail                    # 侧边章节进度导航
   ├─ HeroSection                     # 首页
   ├─ ArchiveLibrary                  # 档案书库
   ├─ HistorySection                  # 历史
   ├─ CultureSection                  # 文化
   ├─ DisciplinesSection              # 学科
   ├─ CampusesSection                 # 校园
   ├─ MessagesSection                 # 寄语
   ├─ PoemLauncher / PoemGift         # 诗歌功能
   ├─ AuthModal                       # 登录注册
   └─ ShareModal                      # 分享
```

`SiteHeader` 和 `ProgressRail` 属于全站布局组件。它们只在根组件中创建一次，通过 props 接收当前页面和导航回调，从而统一管理所有章节的导航状态。

## 7. Hooks 的职责

### `useState`

保存会影响界面显示的数据。调用状态修改函数后，React 会安排一次重新渲染。

```jsx
const [activePage, setActivePage] = useState('top')
setActivePage('culture')
```

### `useEffect`

在浏览器完成页面绘制后执行副作用，适合：

- 请求后端数据；
- 注册和清理事件监听；
- 读写 localStorage；
- 处理不要求在首次绘制前完成的逻辑。

### `useLayoutEffect`

在 React 更新 DOM 后、浏览器绘制画面前同步执行，适合：

- 测量元素尺寸和位置；
- 在用户看到画面前设置滚动位置；
- 初始化必须避免闪烁的动画或布局。

## 8. 样式架构

全局 CSS 在 `main.jsx` 中按以下顺序加载：

```jsx
import './styles/reset.css'
import './styles/tokens.css'
import './styles/scaffold.css'
```

| 文件           | 职责                                               |
| -------------- | -------------------------------------------------- |
| `reset.css`    | 重置默认边距、盒模型、链接和按钮等浏览器基础样式   |
| `tokens.css`   | 定义中大绿、纸张色、字体、线宽、内容宽度等设计变量 |
| `scaffold.css` | 实现所有页面、组件、动画以及移动端响应式效果       |

这种顺序使主样式可以直接使用 `tokens.css` 中的变量，并在需要时覆盖基础重置规则。

## 9. 学科页面与 Three.js 说明

当前学科章节的真实引用关系是：

```text
DisciplinesSection.jsx
        ↓
DisciplineStarMap.jsx
```

最终页面没有导入 `DisciplineOrbit.jsx`。`DisciplineOrbit.jsx`、`OrbitCore.jsx`、`OrbitRing.jsx`、`OrbitWord.jsx` 和 `WebGPUCultureCanvas.jsx` 属于早期 Three.js 实验方案，没有进入从 `main.jsx` 开始的实际引用链。

因此，虽然 `package.json` 仍保留 Three.js、React Three Fiber 和 Drei 依赖，但最终展示页面没有实际运行 Three.js；未被入口引用的模块在生产构建时通常会被 Vite 的 Tree Shaking 排除。

## 10. 前后端通信

开发环境中，Vite 将 `/api` 请求代理到本地 Flask 服务：

```text
浏览器 React 页面
    ↓ fetch('/api/...')
Vite 开发服务器 127.0.0.1:5173
    ↓ proxy
Flask 后端 127.0.0.1:5000
```

生产构建执行：

```bash
npm run build
```

Vite 会把前端输出到 `dist`，再由部署环境或 Flask 提供构建后的静态页面和 API。

## 11. 架构总结

本项目采用“入口文件 + 根状态组件 + 页面章节组件 + 可复用功能组件”的前端结构：

- `main.jsx` 负责启动 React 和加载全局样式；
- `App.jsx` 负责全局状态、导航、转场和页面选择；
- `sections` 负责组织五个主章节；
- `components` 负责实现可复用界面和复杂交互；
- `data`、`config` 和 `utils` 分别管理数据、配置和工具函数；
- Vite 负责开发与构建，Flask 负责后端 API。

该结构将页面控制、章节内容、交互组件和数据配置分离，便于维护、扩展和演示说明。