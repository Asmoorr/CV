"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";

const options = {
  autoRaf: true,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  respectReducedMotion: true,
  anchors: true,
  virtualScroll: ({ deltaX, deltaY, event }: { deltaX: number; deltaY: number; event: WheelEvent | TouchEvent }) => {
    const isPinchZoom = "ctrlKey" in event && event.ctrlKey;
    const isHorizontalGesture = Math.abs(deltaX) >= Math.abs(deltaY);
    const entryIsLocked = document.documentElement.dataset.entryState === "required"
      || document.documentElement.dataset.entryState === "opening";

    return !isPinchZoom && !isHorizontalGesture && !entryIsLocked;
  },
};

function SectionSnap() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => clearTimeout(timer);
    const settle = () => {
      if (!enabled.matches || lenis.isStopped) return;
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.closest("input, textarea, select, [contenteditable=true]")) return;
      if (lenis.isScrolling) {
        timer = setTimeout(settle, 80);
        return;
      }

      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
      const threshold = Math.min(96, window.innerHeight * .1);
      let nearest: number | undefined;
      let distance = threshold;
      // Read live positions so resizing, font loading and locale changes stay aligned.
      document.querySelectorAll<HTMLElement>("main > .section").forEach((section) => {
        const offset = section.getBoundingClientRect().top - header;
        if (Math.abs(offset) < distance) {
          distance = Math.abs(offset);
          nearest = Math.max(0, Math.min(lenis.limit, lenis.scroll + offset));
        }
      });
      if (nearest !== undefined && distance > 1) {
        lenis.scrollTo(nearest, { duration: .4 });
      }
    };
    const onWheel = (event: WheelEvent) => {
      cancel();
      if (!enabled.matches || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      if (event.target instanceof Element && event.target.closest("[data-lenis-prevent], [data-lenis-prevent-wheel], input, textarea, select, [contenteditable=true]")) return;
      timer = setTimeout(settle, 240);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", cancel);
    window.addEventListener("pointerdown", cancel);
    enabled.addEventListener("change", cancel);
    return () => {
      cancel();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", cancel);
      window.removeEventListener("pointerdown", cancel);
      enabled.removeEventListener("change", cancel);
    };
  }, [lenis]);

  return null;
}

export function SmoothWheelScroll() {
  return <ReactLenis root options={options}><SectionSnap /></ReactLenis>;
}
