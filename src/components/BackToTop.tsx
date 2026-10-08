"use client";

import styles from "./BackToTop.module.css";
import { useLenis } from "lenis/react";
import { scrollToTarget } from "@/lib/scroll-navigation";

export function BackToTop({ label }: { label: string }) {
  const lenis = useLenis();

  const scrollToTop = () => {
    window.history.replaceState(window.history.state, "", "#top");
    scrollToTarget(lenis, 0);
    window.requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }));
  };

  return (
    <button className={styles.control} type="button" aria-label={label} data-scroll-target="top" onClick={scrollToTop}>
      <span className={styles.emblem} aria-hidden="true">↑</span>
    </button>
  );
}
