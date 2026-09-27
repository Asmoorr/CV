"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import styles from "./HeroField.module.css";

type Point = { x: number; y: number; phase: number; speed: number; radius: number };

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const updateProgressRef = useRef<(() => void) | null>(null);
  useLenis(() => updateProgressRef.current?.(), []);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.closest("section");
    const context = canvas?.getContext("2d");
    if (!canvas || !hero || !context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let pointer: Pick<Point, "x" | "y"> | null = null;
    let frame = 0;
    let emphasis = 0;
    let visible = false;
    let elapsed = 0;
    let previousTime: number | null = null;

    const draw = (time: number) => {
      frame = 0;
      const moving = !reduced && visible && !document.hidden;
      if (moving && previousTime !== null) elapsed += Math.min(time - previousTime, 50) / 1000;
      previousTime = moving ? time : null;
      context.clearRect(0, 0, width, height);
      for (const point of points) {
        const phase = elapsed * point.speed;
        const x = point.x + (reduced ? 0 : Math.sin(phase + point.phase) * point.radius);
        const y = point.y + (reduced ? 0 : Math.cos(phase * 0.7 + point.phase) * point.radius * 0.75);
        const distance = pointer ? Math.hypot(x - pointer.x, y - pointer.y) : Infinity;
        const active = distance < 150;
        context.fillStyle = active ? `rgba(72,199,244,${0.72 + emphasis * 0.23})` : `rgba(72,199,244,${0.27 + emphasis * 0.38})`;
        context.beginPath();
        context.arc(x, y, (active ? 1.5 : 1) + emphasis * 0.4, 0, Math.PI * 2);
        context.fill();
        if (active && pointer) {
          context.strokeStyle = `rgba(72,199,244,${(1 - distance / 150) * (0.13 + emphasis * 0.15)})`;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }
      }
      if (moving) frame = requestAnimationFrame(draw);
    };

    const queueDraw = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const syncPlayback = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
      if (visible && !document.hidden) queueDraw();
    };

    const updateProgress = () => {
      const state = document.documentElement.dataset.entryState;
      const distance = hero.offsetHeight - window.innerHeight;
      const progress = reduced || state === "required" || state === "opening" || distance <= 0
        ? 0
        : Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance));
      const next = progress * progress * (3 - 2 * progress);
      if (next === emphasis) return;
      emphasis = next;
      canvas.style.setProperty("--field-emphasis", String(emphasis));
      queueDraw();
    };
    updateProgressRef.current = updateProgress;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const random = createRandom((Math.round(width) * 73856093) ^ (Math.round(height) * 19349663));
      const count = Math.max(48, Math.min(240, Math.floor(width * height / 5000)));
      points = Array.from({ length: count }, (_, index) => ({
        x: random() * width,
        y: random() * height,
        phase: index * 2.399963,
        speed: 0.18 + (index % 7) * 0.035,
        radius: 12 + (index % 5) * 5,
      }));
      queueDraw();
      updateProgress();
    };

    const handlePointer = (event: PointerEvent) => {
      if (reduced) return;
      const bounds = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      queueDraw();
    };
    const clearPointer = () => { pointer = null; queueDraw(); };
    const handleMotionChange = () => {
      reduced = motionQuery.matches;
      clearPointer();
      updateProgress();
      syncPlayback();
    };

    resize();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) pointer = null;
      syncPlayback();
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", syncPlayback);
    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", handleMotionChange);
    if (precisePointer) {
      hero.addEventListener("pointermove", handlePointer);
      hero.addEventListener("pointerleave", clearPointer);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      updateProgressRef.current = null;
      motionQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("resize", resize);
      hero.removeEventListener("pointermove", handlePointer);
      hero.removeEventListener("pointerleave", clearPointer);
    };
  }, []);

  return <canvas ref={ref} className={styles.field} aria-hidden="true" />;
}
