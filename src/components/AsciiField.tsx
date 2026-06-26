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
    const cell = coarse ? 28 : 22;
    const radius = 175;
    const SKIP = 0.05; // don't draw barely-visible cells

    const STEPS = 22;
    const palette = Array.from({ length: STEPS }, (_, i) => {
      const a = (i / (STEPS - 1)) * 0.9;
      return `rgba(31,81,48,${a.toFixed(3)})`;
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

    function render() {
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
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const wave = Math.sin(
            x * 0.34 + y * 0.26 - scroll * 0.012 - frame * 0.02,
          );
          let a = 0.04 + Math.max(0, wave) * 0.1 + boost;
          if (!coarse) {
            const dx = x * cell + cell / 2 - mouse.x;
            const dy = y * cell + cell / 2 - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < radius) a += (1 - d / radius) * 0.75;
          }
          if (a < SKIP) continue; // skip near-invisible cells
          let idx = (a / 0.9) * (STEPS - 1);
          idx = idx > STEPS - 1 ? STEPS - 1 : idx | 0;
          ctx!.fillStyle = palette[idx];
          ctx!.fillText(
            chars[grid[y * cols + x]],
            x * cell + cell / 2,
            y * cell + cell / 2,
          );
        }
      }
      raf = requestAnimationFrame(render);
    }

    function start() {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(render);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function staticDraw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = "rgba(31,81,48,0.06)";
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++)
          ctx!.fillText(
            chars[grid[y * cols + x]],
            x * cell + cell / 2,
            y * cell + cell / 2,
          );
    }

    // Only run the loop while the hero is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reduce) staticDraw();
          else start();
        } else {
          stop();
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
