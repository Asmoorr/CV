"use client";

import { useEffect } from "react";

const STOP_EPSILON = 0.35;
const LINE_HEIGHT = 16;
const MAX_WHEEL_DELTA = 180;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeDelta(event: WheelEvent) {
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? LINE_HEIGHT
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
      ? window.innerHeight
      : 1;

  return clamp(event.deltaY * unit, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
}

function canScrollInDirection(element: HTMLElement, delta: number) {
  const style = window.getComputedStyle(element);
  const scrollable = /(auto|scroll|overlay)/.test(style.overflowY);
  if (!scrollable || element.scrollHeight <= element.clientHeight) return false;
  if (delta < 0) return element.scrollTop > 0;
  return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
}

function hasScrollableAncestor(target: EventTarget | null, delta: number) {
  let element = target instanceof HTMLElement ? target : null;

  while (element && element !== document.body) {
    if (canScrollInDirection(element, delta)) return true;
    element = element.parentElement;
  }

  return false;
}

export function SmoothWheelScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let current = window.scrollY;
    let target = current;
    let frame = 0;
    let smoothing = 0.18;
    let previousDirection = 0;

    const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);

    const setState = (state: "active" | "idle") => {
      root.dataset.smoothScrollState = state;
      root.classList.toggle("is-wheel-scrolling", state === "active");
    };

    const draw = () => {
      frame = 0;
      const limit = maxScroll();
      target = clamp(target, 0, limit);
      const difference = target - current;

      if (Math.abs(difference) <= STOP_EPSILON) {
        current = target;
        window.scrollTo({ top: current, behavior: "instant" });
        setState("idle");
        return;
      }

      current = clamp(current + difference * smoothing, 0, limit);
      window.scrollTo({ top: current, behavior: "instant" });
      frame = requestAnimationFrame(draw);
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented
        || event.ctrlKey
        || event.deltaY === 0
        || Math.abs(event.deltaX) > Math.abs(event.deltaY)
        || hasScrollableAncestor(event.target, event.deltaY)
      ) {
        return;
      }

      const delta = normalizeDelta(event);
      if (delta === 0) return;

      event.preventDefault();
      const actual = window.scrollY;
      if (!frame || Math.abs(actual - current) > 2) {
        current = actual;
        target = actual;
      }

      const direction = Math.sign(delta);
      if (previousDirection && direction !== previousDirection) target = current;
      previousDirection = direction;

      const trackpadLike = event.deltaMode === WheelEvent.DOM_DELTA_PIXEL && Math.abs(event.deltaY) < 50;
      smoothing = trackpadLike ? 0.34 : 0.18;
      target = clamp(target + delta, 0, maxScroll());
      setState("active");
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const syncPosition = () => {
      if (frame) return;
      current = window.scrollY;
      target = current;
    };

    const handleResize = () => {
      const limit = maxScroll();
      current = clamp(window.scrollY, 0, limit);
      target = clamp(target, 0, limit);
    };

    root.dataset.smoothScroll = "enabled";
    setState("idle");
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", syncPosition, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", syncPosition);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
      root.classList.remove("is-wheel-scrolling");
      delete root.dataset.smoothScroll;
      delete root.dataset.smoothScrollState;
    };
  }, []);

  return null;
}
