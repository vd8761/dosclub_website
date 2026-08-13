"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive ASCII field rendered on a canvas.
 * - A diagonal "wave" of glyphs flows with scroll position + velocity.
 * - On desktop, the cursor reveals a bright spotlight of characters.
 * Only animates while the hero is on screen, and skips near-invisible
 * cells, to keep the rest of the page smooth.
 */
export default function AsciiField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const chars = "</>{}()[];=+-*$#01_L:.".split("");
    const cell = coarse ? 32 : 24; // 8px grid
    const radius = 176;
    const radius2 = radius * radius;
    const SKIP = 0.05; // don't draw barely-visible cells
    const FRAME_MS = 1000 / 30; // 30fps is plenty for this texture, and
    // leaves half the frame budget to the scroller

    const STEPS = 22;
    // deep (#0c3346) - matches --color-deep
    const palette = Array.from({ length: STEPS }, (_, i) => {
      const a = (i / (STEPS - 1)) * 0.9;
      return `rgba(12,51,70,${a.toFixed(3)})`;
    });

    let w = 0,
      h = 0,
      cols = 0,
      rows = 0;
    let grid: Uint8Array = new Uint8Array(0);
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let lastScroll = window.scrollY;
    let vel = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = parent!.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      grid = new Uint8Array(cols * rows);
      for (let i = 0; i < grid.length; i++)
        grid[i] = Math.floor(Math.random() * chars.length);
      ctx!.font = `${Math.floor(cell * 0.78)}px ui-monospace, monospace`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const onMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    };
    if (!coarse)
      window.addEventListener("mousemove", onMove, { passive: true });

    let frame = 0;
    let raf = 0;
    let running = false;

    let last = 0;

    function render(now: number) {
      raf = requestAnimationFrame(render);
      if (now - last < FRAME_MS) return;
      last = now;

      frame++;
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;

      const scroll = window.scrollY;
      vel += (Math.min(Math.abs(scroll - lastScroll), 120) / 120 - vel) * 0.1;
      lastScroll = scroll;

      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < 5; i++)
        grid[(Math.random() * grid.length) | 0] = Math.floor(
          Math.random() * chars.length,
        );

      const boost = vel * 0.25;
      const half = cell / 2;
      const phase = -scroll * 0.012 - frame * 0.02;
      // Setting fillStyle is a canvas state change; neighbouring cells
      // usually land on the same palette step, so only write it on change.
      let lastIdx = -1;

      for (let y = 0; y < rows; y++) {
        const cy = y * cell + half;
        const rowPhase = y * 0.26 + phase;
        const dy = cy - mouse.y;
        const dy2 = dy * dy;
        // The whole row is outside the spotlight - skip the distance math.
        const rowLit = !coarse && dy2 < radius2;

        for (let x = 0; x < cols; x++) {
          const wave = Math.sin(x * 0.34 + rowPhase);
          let a = 0.07 + (wave > 0 ? wave * 0.16 : 0) + boost;

          if (rowLit) {
            const dx = x * cell + half - mouse.x;
            const d2 = dx * dx + dy2;
            if (d2 < radius2) a += (1 - Math.sqrt(d2) / radius) * 0.75;
          }

          if (a < SKIP) continue; // skip near-invisible cells
          let idx = (a / 0.9) * (STEPS - 1);
          idx = idx > STEPS - 1 ? STEPS - 1 : idx | 0;
          if (idx !== lastIdx) {
            ctx!.fillStyle = palette[idx];
            lastIdx = idx;
          }
          ctx!.fillText(chars[grid[y * cols + x]], x * cell + half, cy);
        }
      }
    }

    function start() {
      if (running || reduce || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(render);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function staticDraw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = "rgba(12,51,70,0.09)";
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++)
          ctx!.fillText(
            chars[grid[y * cols + x]],
            x * cell + cell / 2,
            y * cell + cell / 2,
          );
    }

    // Only run the loop while the hero is on screen AND the tab is visible.
    let onScreen = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) stop();
        else if (reduce) staticDraw();
        else start();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
