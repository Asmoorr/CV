"use client";

import styles from "./BackToTop.module.css";
import { useLenis } from "lenis/react";

export function BackToTop({ label }: { label: string }) {
  const lenis = useLenis();

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.history.replaceState(window.history.state, "", "#top");
    lenis?.scrollTo(0, {
      duration: 1.4,
      easing: (time) => time * time * (3 - 2 * time),
      immediate: reducedMotion,
    });
    window.requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }));
  };

  return (
    <button className={styles.control} type="button" aria-label={label} data-scroll-target="top" onClick={scrollToTop}>
      <span className={styles.emblem} aria-hidden="true">↑</span>
    </button>
  );
}
