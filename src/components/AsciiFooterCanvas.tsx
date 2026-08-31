"use client";

import React, { useEffect, useRef } from "react";
import { DOS_ASCII_RAW } from "@/data/asciiLogo";

export default function AsciiFooterCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Parse ASCII text into points
    const lines = DOS_ASCII_RAW.split("\n");
    const rawPoints: { x: number; y: number; char: string }[] = [];

    const numRows = lines.length;
    let maxCols = 0;
    lines.forEach((l) => {
      if (l.length > maxCols) maxCols = l.length;
    });

    lines.forEach((line, r) => {
      // Step sampling to keep particles ultra high FPS (120fps+ without lag)
      for (let c = 0; c < line.length; c += 3) {
        const char = line[c];
        if (char && char !== " ") {
          rawPoints.push({
            x: c,
            y: r,
            char: char,
          });
        }
      }
    });

    interface Particle {
      x: number;
      y: number;
      char: string;
      scale: number; // 0 to 1 intensity (1 = active/hovered, 0 = resting)
      alpha: number;
    }

    let particles: Particle[] = [];
    let animationFrameId: number;

    const mouse = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const logoAspect = maxCols / (numRows * 1.8);
      const logoWidth = Math.min(width / 3, 580);
      const height = logoWidth / logoAspect;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      particles = [];

      const totalLogos = 3;
      const spacing = width / totalLogos;

      for (let i = 0; i < totalLogos; i++) {
        const centerLogoX = spacing * i + spacing / 2;
        const scaleX = (logoWidth * 0.95) / maxCols;
        const scaleY = (height * 0.9) / numRows;

        rawPoints.forEach((p) => {
          const px = centerLogoX - (maxCols * scaleX) / 2 + p.x * scaleX;
          const py = (height - numRows * scaleY) / 2 + p.y * scaleY;

          particles.push({
            x: px,
            y: py,
            char: p.char,
            scale: 0,
            alpha: 0.35,
          });
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }
    };

    const onTouchEnd = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const TOUCH_RADIUS = 28; // Touch detection radius
    const DECAY_RATE = 1 / (60 * 0.5); // Linearly fade back in exactly 0.5 seconds (at 60fps)

    const render = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = parseFloat(canvas.style.height) || 200;

      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const len = particles.length;
      const mx = mouse.x;
      const my = mouse.y;
      const isActive = mouse.active;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Trigger on mouse hover over character
        if (isActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;

          if (distSq < TOUCH_RADIUS * TOUCH_RADIUS) {
            const dist = Math.sqrt(distSq);
            const intensity = 1 - dist / TOUCH_RADIUS;
            if (intensity > p.scale) {
              p.scale = intensity;
            }
          }
        }

        // Linear decay over 0.5 seconds
        if (p.scale > 0) {
          p.scale = Math.max(0, p.scale - DECAY_RATE);
        }

        // Base font size is 8px. Hovered state is bold, +5% bigger font size (~8.4px)
        const currentFontSize = 8 + p.scale * 0.4;
        const currentAlpha = 0.35 + p.scale * 0.65; // Boost opacity to 1.0 on touch
        const isHighlighted = p.scale > 0.05;

        ctx.font = `${isHighlighted ? "900" : "500"} ${currentFontSize}px monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      if (running) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    let onScreen = false;
    let running = false;

    function startLoop() {
      if (running) return;
      running = true;
      animationFrameId = requestAnimationFrame(render);
    }

    function stopLoop() {
      running = false;
      cancelAnimationFrame(animationFrameId);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) {
          stopLoop();
        } else {
          startLoop();
        }
      },
      { threshold: 0.01 }
    );

    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else if (onScreen) {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden pb-8 pt-4 flex justify-center select-none"
      style={{ cursor: "crosshair" }}
    >
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
