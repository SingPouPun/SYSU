import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import SysuLionRunner from "./SysuLionRunner.jsx";

// useRef 用于取得启动画面的真实 DOM。
// useLayoutEffect 会在浏览器绘制页面前设置动画，减少元素闪烁。
// GSAP 负责精确编排运动时间。
const INITIAL_GLYPHS = ["大", "山", "中", "学"];

export default function OpeningSequence({ visible, onCovered, onFinish }) {
  // 创建一个“盒子”，稍后把真正的 <section> DOM 放进来。
  const rootRef = useRef(null);
  const isEnteringRef = useRef(false);

  function handleEnter() {
    if (isEnteringRef.current) return;
    isEnteringRef.current = true;

    const root = rootRef.current;
    const topFilm = root.querySelector(".opening-film-strip--top-left");
    const bottomFilm = root.querySelector(".opening-film-strip--bottom-right");
    const topRect = topFilm.getBoundingClientRect();
    const bottomRect = bottomFilm.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    root.classList.add("is-film-transition");

    // 停止首页背景中仍在运行的文字、建筑和加载动画，把渲染资源留给转场。
    gsap.killTweensOf(
      root.querySelectorAll(
        ".opening-university-track, .campus-building, .building-loading-letter, .building-loading-pip",
      ),
    );

    // 胶片孔先突然加速，像放映机被快速启动。
    gsap.to(".opening-film-strip--top-left .film-holes", {
      y: "+=650",
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    });
    gsap.to(".opening-film-strip--bottom-right .film-holes", {
      y: "-=650",
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    });

    gsap.timeline({ onComplete: onFinish })
      .to(
        [
          ".opening-side-word",
          ".opening-university-name",
          ".opening-emblem",
          ".opening-tiles",
          ".lion-runner-scaffold",
        ],
        {
          autoAlpha: 0,
          scale: 0.92,
          duration: 0.16,
          ease: "power2.in",
        },
        0.08,
      )
      .to(
        ".opening-scaffold > button",
        {
          autoAlpha: 0,
          duration: 0.08,
          ease: "power2.in",
        },
        0.13,
      )
      .to(topFilm, {
        x: centerX - (topRect.left + topRect.width / 2),
        y: centerY - (topRect.top + topRect.height / 2),
        scale: 2.85,
        force3D: true,
        duration: 0.48,
        ease: "power4.in",
      }, 0.15)
      .to(bottomFilm, {
        x: centerX - (bottomRect.left + bottomRect.width / 2),
        y: centerY - (bottomRect.top + bottomRect.height / 2),
        scale: 2.85,
        force3D: true,
        duration: 0.48,
        ease: "power4.in",
      }, 0.17)
      .call(onCovered, [], 0.62)
      .call(() => root.classList.add("is-film-revealing"), [], 0.63)
      .to(topFilm, {
        x: `-=${window.innerWidth * 1.25}`,
        y: `-=${window.innerHeight * 0.95}`,
        scale: 2.55,
        force3D: true,
        duration: 0.66,
        ease: "power4.out",
      }, 0.63)
      .to(bottomFilm, {
        x: `+=${window.innerWidth * 1.25}`,
        y: `+=${window.innerHeight * 0.95}`,
        scale: 2.55,
        force3D: true,
        duration: 0.66,
        ease: "power4.out",
      }, 0.65)
      .to(root, { autoAlpha: 0, duration: 0.08 }, 1.31);
  }

  useLayoutEffect(() => {
    if (!visible) return undefined;

    // context 把选择器和动画限制在当前启动画面中。
    const context = gsap.context(() => {
      const tiles = gsap.utils.toArray(".opening-tile");
      const tileShells = gsap.utils.toArray(".opening-tile-shell");
      const timeline = gsap.timeline();

      // 两侧胶片像被机械链轮逐段拉入：先快速拖入，再经过两次收紧回弹。
      timeline.fromTo(
        ".opening-film-strip--top-left",
        {
          x: -420,
          y: -420,
          autoAlpha: 0,
        },
        {
          keyframes: [
            { x: 38, y: 38, autoAlpha: 1, duration: 0.62, ease: "power4.out" },
            { x: -18, y: -18, duration: 0.12, ease: "power2.inOut" },
            { x: 9, y: 9, duration: 0.1, ease: "power2.out" },
            { x: 0, y: 0, duration: 0.16, ease: "back.out(2.4)" },
          ],
        },
        0,
      );

      timeline.fromTo(
        ".opening-film-strip--bottom-right",
        {
          x: 420,
          y: 420,
          autoAlpha: 0,
        },
        {
          keyframes: [
            { x: -38, y: -38, autoAlpha: 1, duration: 0.62, ease: "power4.out" },
            { x: 18, y: 18, duration: 0.12, ease: "power2.inOut" },
            { x: -9, y: -9, duration: 0.1, ease: "power2.out" },
            { x: 0, y: 0, duration: 0.16, ease: "back.out(2.4)" },
          ],
        },
        0.08,
      );

      // 到位后的孔位持续缓慢循环，制造铁索链节仍在运转的感觉。
      gsap.to(".opening-film-strip--top-left .film-holes", {
        y: 65,
        duration: 0.9,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".opening-film-strip--bottom-right .film-holes", {
        y: -65,
        duration: 0.9,
        ease: "none",
        repeat: -1,
      });

      // 三段完全相同的校名首尾衔接；每轮恰好移动总轨道的三分之一。
      // 动画归零时，下一段文字与上一段处于同一位置，因此没有跳缝。
      gsap.fromTo(
        ".opening-university-track",
        { xPercent: -100 / 3 },
        {
          xPercent: 0,
          duration: 11,
          ease: "none",
          repeat: -1,
        },
      );

      // 先隐藏“重排完成”状态和进入按钮，等交换结束后再显示。
      gsap.set(".opening-order--final", { autoAlpha: 0, y: 12 });
      gsap.set([".opening-scaffold > p", ".opening-scaffold > button"], {
        autoAlpha: 0,
        y: 16,
      });

      // 圆形校徽从顶部右侧滚入，并在页面上方回弹停稳。
      timeline.fromTo(
        ".opening-emblem",
        {
          x: Math.min(window.innerWidth * 0.42, 520),
          y: -145,
          rotation: 720,
          autoAlpha: 0,
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 1.18,
          ease: "back.out(1.35)",
        },
        0.16,
      );

      tiles.forEach((tile, index) => {
        // 四个方格分别从 0、0.13、0.26、0.39 秒开始下落。
        const dropAt = index * 0.16;

        // 下落持续 0.72 秒，0.68 秒时开始制造落地冲击。
        const impactAt = dropAt + 0.68;

        // 冲击线位于外层 shell 内，因此不会被方格的 clip-path 裁掉。
        const tileShell = tile.closest(".opening-tile-shell");
        const impactLine = tileShell.querySelector(".tile-impact-line");

        // 方格从屏幕上方依次掉落。
        timeline.fromTo(
          tile,
          {
            y: -window.innerHeight * 0.7,
            autoAlpha: 0,
            rotation: index % 2 === 0 ? -12 : 12,
            transformOrigin: "50% 100%",
          },
          {
            y: 0,
            autoAlpha: 1,
            rotation: 0,
            duration: 0.72,
            ease: "back.out(1.35)",
          },
          dropAt,
        );

        // 落地瞬间：略微变宽、压低，并让阴影贴近地面。
        timeline.to(
          tile,
          {
            scaleX: 1.6,
            scaleY: 0.40,
            boxShadow: "13px 3px 0 #006633",
            duration: 0.08,
            ease: "power2.out",
          },
          impactAt,
        );

        // 冲击后恢复正常形状。
        timeline.to(
          tile,
          {
            scaleX: 1,
            scaleY: 1,
            boxShadow: "8px 8px 0 #777",
            duration: 0.16,
            ease: "back.out(2)",
          },
          impactAt + 0.08,
        );

        // 冲击线从宽度 0 快速出现。
        timeline.fromTo(
          impactLine,
          {
            scaleX: 0,
            autoAlpha: 0,
          },
          {
            scaleX: 1,
            autoAlpha: 1,
            duration: 0.1,
            ease: "power3.out",
          },
          impactAt,
        );

        // 冲击线继续向两侧扩散，同时消失。
        timeline.to(
          impactLine,
          {
            scaleX: 1.6,
            autoAlpha: 0,
            duration: 0.24,
            ease: "power2.out",
          },
          impactAt + 0.1,
        );
      });

      // 第一格“大”和第三格“中”的中心距离会随屏幕宽度变化，
      // 所以从真实 DOM 位置计算，不把移动像素写死。
      const firstShell = tileShells[0];
      const thirdShell = tileShells[2];
      const firstTile = tiles[0];
      const thirdTile = tiles[2];
      const firstImpactLine = firstShell.querySelector(".tile-impact-line");
      const thirdImpactLine = thirdShell.querySelector(".tile-impact-line");
      const swapDistance =
        thirdShell.getBoundingClientRect().left -
        firstShell.getBoundingClientRect().left;

      // 所有方格落地后，先让“大山中学”停留，再开始交换。
      timeline.addLabel("reorder", 2.05);

      timeline.to(
        [firstTile, thirdTile],
        {
          scaleX: 1.12,
          scaleY: 0.84,
          duration: 0.1,
          ease: "power2.in",
        },
        "reorder",
      );

      // “大”从上方越过，“中”从下方穿过，避免两格完全重叠。
      timeline.set(firstShell, { zIndex: 8 }, "reorder+=0.08");
      timeline.set(thirdShell, { zIndex: 7 }, "reorder+=0.08");

      timeline.to(
        firstShell,
        {
          keyframes: [
            {
              x: swapDistance * 0.48,
              y: -72,
              rotation: -7,
              duration: 0.3,
              ease: "power2.out",
            },
            {
              x: swapDistance,
              y: 0,
              rotation: 0,
              duration: 0.34,
              ease: "power3.in",
            },
          ],
        },
        "reorder+=0.08",
      );

      timeline.to(
        thirdShell,
        {
          keyframes: [
            {
              x: -swapDistance * 0.48,
              y: 72,
              rotation: 7,
              duration: 0.3,
              ease: "power2.out",
            },
            {
              x: -swapDistance,
              y: 0,
              rotation: 0,
              duration: 0.34,
              ease: "power3.in",
            },
          ],
        },
        "reorder+=0.08",
      );

      // 新位置落地：再次压扁并释放冲击线。
      timeline.to(
        [firstTile, thirdTile],
        {
          scaleX: 1.5,
          scaleY: 0.48,
          boxShadow: "13px 3px 0 #006633",
          duration: 0.08,
          ease: "power2.out",
        },
        "reorder+=0.68",
      );

      timeline.fromTo(
        [firstImpactLine, thirdImpactLine],
        { scaleX: 0, autoAlpha: 0 },
        {
          scaleX: 1.55,
          autoAlpha: 1,
          duration: 0.1,
          ease: "power3.out",
        },
        "reorder+=0.68",
      );

      timeline.to(
        [firstTile, thirdTile],
        {
          scaleX: 1,
          scaleY: 1,
          boxShadow: "8px 8px 0 #777",
          duration: 0.22,
          ease: "back.out(3)",
        },
        "reorder+=0.76",
      );

      timeline.to(
        [firstImpactLine, thirdImpactLine],
        {
          scaleX: 1.9,
          autoAlpha: 0,
          duration: 0.22,
          ease: "power2.out",
        },
        "reorder+=0.78",
      );

      // 旧状态退出，最终“中山大学”确认状态进入。
      timeline.to(
        ".opening-order--initial",
        { autoAlpha: 0, y: -10, duration: 0.16 },
        "reorder+=0.82",
      );
      timeline.to(
        ".opening-order--final",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.28,
          ease: "back.out(2)",
        },
        "reorder+=0.94",
      );
      timeline.to(
        [".opening-scaffold > p", ".opening-scaffold > button"],
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.32,
          stagger: 0.08,
          ease: "power2.out",
        },
        "reorder+=1.08",
      );
    }, rootRef);

    // 组件被移除时，清除这次创建的全部 GSAP 动画。
    return () => context.revert();
  }, [visible]);

  // visible 为 false 时，不在页面中渲染启动动画。
  if (!visible) return null;

  return (
    <section
      ref={rootRef}
      className="opening-scaffold"
      aria-label="启动动画教学骨架"
    >
      <div className="opening-side-word opening-side-word--left" aria-hidden="true">
        <span>S</span>
        <span>Y</span>
        <span>S</span>
        <span>U</span>
      </div>

      <div className="opening-university-name" aria-hidden="true">
        <div className="opening-university-track">
          <span>SUN YAT-SEN UNIVERSITY</span>
          <span>SUN YAT-SEN UNIVERSITY</span>
          <span>SUN YAT-SEN UNIVERSITY</span>
        </div>
      </div>

      <img
        className="opening-emblem"
        src="/branding/sysu-emblem.png"
        alt="中山大学校徽"
      />



      <div className="opening-tiles">
        {INITIAL_GLYPHS.map((glyph, index) => (
          <div className="opening-tile-shell" key={`${glyph}-${index}`}>
            <div className="opening-tile">

              <b>{glyph}</b>
            </div>

            <span className="tile-impact-line" aria-hidden="true" />
          </div>
        ))}
      </div>


      <SysuLionRunner mode="opening" />

      <div
        className="opening-film-strip opening-film-strip--top-left"
        aria-hidden="true"
      >
        <div className="film-holes">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div
        className="opening-film-strip opening-film-strip--bottom-right"
        aria-hidden="true"
      >
        <div className="film-holes">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <button type="button" onClick={handleEnter}>
        ENTER
      </button>
    </section>
  );
}
