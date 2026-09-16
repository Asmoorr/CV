"use client";

import { useEffect, useRef, useState } from "react";
import type { EntryContent } from "@/content/schema";
import { ENTRY_SESSION_KEY } from "./entrySession";
import styles from "./SiteEntry.module.css";

type Phase = "checking" | "loading" | "ready" | "exiting" | "hidden";

export function SiteEntry({ content }: { content: EntryContent }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let initialFrame = 0;
    try {
      if (sessionStorage.getItem(ENTRY_SESSION_KEY) === "true") {
        document.documentElement.dataset.entryState = "entered";
        initialFrame = requestAnimationFrame(() => setPhase("hidden"));
        return () => cancelAnimationFrame(initialFrame);
      }
    } catch {
      document.documentElement.dataset.entryState = "entered";
      initialFrame = requestAnimationFrame(() => setPhase("hidden"));
      return () => cancelAnimationFrame(initialFrame);
    }

    document.documentElement.dataset.entryState = "loading";
    initialFrame = requestAnimationFrame(() => setPhase("loading"));
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active) setPhase("ready");
    }, 1800);

    Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => window.setTimeout(resolve, 1600)),
    ]).then(() => {
      if (!active) return;
      window.clearTimeout(timeout);
      requestAnimationFrame(() => setPhase("ready"));
    });

    return () => {
      active = false;
      cancelAnimationFrame(initialFrame);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (phase === "ready") {
      document.documentElement.dataset.entryState = "ready";
      buttonRef.current?.focus();
    }
  }, [phase]);

  const enter = () => {
    if (phase !== "ready") return;
    try {
      sessionStorage.setItem(ENTRY_SESSION_KEY, "true");
    } catch {
      // The page still opens when storage is unavailable.
    }
    document.documentElement.dataset.entryState = "exiting";
    setPhase("exiting");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      document.documentElement.dataset.entryState = "entered";
      setPhase("hidden");
      const main = document.getElementById("main");
      main?.setAttribute("tabindex", "-1");
      main?.focus({ preventScroll: true });
    }, reduced ? 0 : 680);
  };

  if (phase === "checking" || phase === "hidden") return null;

  return (
    <div className={styles.overlay} data-phase={phase} role="dialog" aria-modal="true" aria-label={content.ariaLabel}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.center}>
        <p className={styles.loading} aria-live="polite">{phase === "loading" ? `${content.loading}…` : ""}</p>
        <button ref={buttonRef} className={styles.enter} type="button" onClick={enter} disabled={phase !== "ready"}>
          <span>{content.enter}</span>
          <svg viewBox="0 0 260 72" aria-hidden="true">
            <path d="M8 1h244a7 7 0 0 1 7 7v45l-18 18H8a7 7 0 0 1-7-7V8a7 7 0 0 1 7-7Z" />
          </svg>
        </button>
        <span className={styles.pointer} aria-hidden="true"><i /></span>
      </div>
      <p className={styles.mark}>AT / 26</p>
    </div>
  );
}
