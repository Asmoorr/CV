"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroField.module.css";

type Point = { x: number; y: number; vx: number; vy: number };

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

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
    let isVisible = true;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(24, Math.min(62, Math.floor(width / 24)));
      const random = createRandom((Math.round(width) * 73856093) ^ (Math.round(height) * 19349663));
      points = Array.from({ length: count }, () => ({
        x: random() * width,
        y: random() * height,
        vx: (random() - 0.5) * 0.18,
        vy: (random() - 0.5) * 0.18,
      }));
    };

    const draw = () => {
      frame = 0;
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
      if (!reduced && isVisible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!frame && !reduced && isVisible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const handleResize = () => {
      stop();
      resize();
      draw();
    };

    const handleVisibility = () => document.hidden ? stop() : start();

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start(); else stop();
    });

    resize();
    draw();
    observer.observe(canvas);
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={ref} className={styles.field} aria-hidden="true" />;
}
