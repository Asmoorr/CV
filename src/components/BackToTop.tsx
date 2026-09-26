"use client";

import styles from "./BackToTop.module.css";

export function BackToTop({ label }: { label: string }) {
  const scrollToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.dispatchEvent(new Event("smooth-scroll:reset"));
    window.history.replaceState(window.history.state, "", "#top");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    window.requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }));
  };

  return (
    <button className={styles.control} type="button" aria-label={label} data-scroll-target="top" onClick={scrollToTop}>
      <span className={styles.emblem} aria-hidden="true">↑</span>
    </button>
  );
}
