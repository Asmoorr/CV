"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; vx: number; vy: number };

export function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let points: Point[] = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(24, Math.min(62, Math.floor(width / 24)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        if (!reduced) {
          point.x = (point.x + point.vx + width) % width;
          point.y = (point.y + point.vy + height) % height;
        }
        context.fillStyle = "rgba(72,199,244,.62)";
        context.beginPath();
        context.arc(point.x, point.y, 1.15, 0, Math.PI * 2);
        context.fill();
        for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
          const other = points[otherIndex];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 116) {
            context.strokeStyle = `rgba(72,199,244,${(1 - distance / 116) * 0.14})`;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="hero-field" aria-hidden="true" />;
}
