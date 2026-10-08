"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { scrollToTarget } from "@/lib/scroll-navigation";

const options = {
  autoRaf: true,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  respectReducedMotion: true,
  anchors: false,
  virtualScroll: ({ deltaX, deltaY, event }: { deltaX: number; deltaY: number; event: WheelEvent | TouchEvent }) => {
    const isPinchZoom = "ctrlKey" in event && event.ctrlKey;
    const isHorizontalGesture = Math.abs(deltaX) >= Math.abs(deltaY);
    const entryIsLocked = document.documentElement.dataset.entryState === "required"
      || document.documentElement.dataset.entryState === "opening";

    return !isPinchZoom && !isHorizontalGesture && !entryIsLocked;
  },
};

function AnchorNavigation() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    let frame = 0;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      let id: string;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;

      // Suppress the native anchor jump before starting the single animation.
      event.preventDefault();
      cancelAnimationFrame(frame);
      // Let React close the menu and release its body scroll lock first.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          lenis.resize();
          window.history.pushState(window.history.state, "", url.hash);
          scrollToTarget(lenis, id === "top" ? 0 : target);
        });
      });
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
    };
  }, [lenis]);

  return null;
}

function SectionSnap() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const enabled = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let touching = false;
    let touchScroll = false;
    let touchStartX = 0;
    let touchStartY = 0;
    const cancel = () => { clearTimeout(timer); touchScroll = false; };
    const settle = () => {
      if (!enabled.matches || lenis.isStopped || touching) return;
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
        touchScroll = false;
        scrollToTarget(lenis, nearest, .65);
      }
      touchScroll = false;
    };
    const onWheel = (event: WheelEvent) => {
      cancel();
      if (!enabled.matches || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      if (event.target instanceof Element && event.target.closest("[data-lenis-prevent], [data-lenis-prevent-wheel], input, textarea, select, [contenteditable=true]")) return;
      timer = setTimeout(settle, 240);
    };
    const onTouchStart = (event: TouchEvent) => {
      cancel();
      touching = false;
      if (!enabled.matches || event.touches.length !== 1) return;
      if (event.target instanceof Element && event.target.closest("[data-lenis-prevent], [data-lenis-prevent-touch], input, textarea, select, [contenteditable=true]")) return;
      touching = true;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) { touching = false; cancel(); return; }
      if (!touching) return;
      const dx = Math.abs(event.touches[0].clientX - touchStartX);
      const dy = Math.abs(event.touches[0].clientY - touchStartY);
      touchScroll = dy > 8 && dy > dx;
    };
    const onTouchEnd = () => {
      touching = false;
      if (touchScroll) timer = setTimeout(settle, 240);
    };
    const onTouchCancel = () => { touching = false; cancel(); };
    const onScroll = () => {
      // Wait for native momentum to finish; never snap during an anchor animation.
      if (!touchScroll || touching || lenis.isScrolling === "smooth") return;
      clearTimeout(timer);
      timer = setTimeout(settle, 240);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", cancel);
    window.addEventListener("keydown", cancel);
    window.addEventListener("pointerdown", cancel);
    enabled.addEventListener("change", cancel);
    return () => {
      cancel();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", cancel);
      window.removeEventListener("keydown", cancel);
      window.removeEventListener("pointerdown", cancel);
      enabled.removeEventListener("change", cancel);
    };
  }, [lenis]);

  return null;
}

export function SmoothWheelScroll() {
  return <ReactLenis root options={options}><AnchorNavigation /><SectionSnap /></ReactLenis>;
}
