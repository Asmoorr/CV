"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroField.module.css";

type Point = { x: number; y: number };

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
    const hero = canvas?.closest("section");
    const context = canvas?.getContext("2d");
    if (!canvas || !hero || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let pointer: Point | null = null;
    let frame = 0;

    const draw = () => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      for (const point of points) {
        const distance = pointer ? Math.hypot(point.x - pointer.x, point.y - pointer.y) : Infinity;
        const active = distance < 150;
        context.fillStyle = active ? "rgba(72,199,244,.72)" : "rgba(72,199,244,.27)";
        context.beginPath();
        context.arc(point.x, point.y, active ? 1.5 : 1, 0, Math.PI * 2);
        context.fill();
        if (active && pointer) {
          context.strokeStyle = `rgba(72,199,244,${(1 - distance / 150) * .13})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }
      }
    };

    const queueDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const random = createRandom((Math.round(width) * 73856093) ^ (Math.round(height) * 19349663));
      const count = Math.max(16, Math.min(32, Math.floor(width / 42)));
      points = Array.from({ length: count }, () => ({ x: random() * width, y: random() * height }));
      queueDraw();
    };

    const handlePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      queueDraw();
    };
    const clearPointer = () => { pointer = null; queueDraw(); };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced && precisePointer) {
      hero.addEventListener("pointermove", handlePointer);
      hero.addEventListener("pointerleave", clearPointer);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      hero.removeEventListener("pointermove", handlePointer);
      hero.removeEventListener("pointerleave", clearPointer);
    };
  }, []);

  return <canvas ref={ref} className={styles.field} aria-hidden="true" />;
}
