import type Lenis from "lenis";

export function scrollToTarget(lenis: Lenis | undefined, target: HTMLElement | number, duration = 1.8) {
  if (lenis?.isStopped) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Native smooth scrolling has no duration control. Use one timing curve for
  // navigation on every device; ordinary touch scrolling remains native.
  if (lenis) {
    lenis.scrollTo(target, {
      duration,
      lerp: 0,
      easing: (time) => time * time * (3 - 2 * time),
      immediate: reduced,
    });
    return;
  }

  let top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
  if (typeof target !== "number") {
    top -= parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    top -= parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  }
  window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "instant" : "smooth" });
}
