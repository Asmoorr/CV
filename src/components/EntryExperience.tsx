"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type TransitionEvent } from "react";
import { useLenis } from "lenis/react";
import type { EntryContent } from "@/content/schema";
import { ENTRY_SESSION_KEY } from "@/lib/site-entry";
import { FinePointerCursor } from "@/components/FinePointerCursor";
import styles from "./EntryExperience.module.css";

type EntryPhase = "loading" | "ready" | "opening" | "entered" | "bypassed";

const OPEN_DURATION = 780;
const READY_TIMEOUT = 1100;

export function EntryExperience({ content, children }: { content: EntryContent; children: ReactNode }) {
  const lenis = useLenis();
  const [phase, setPhase] = useState<EntryPhase>("loading");
  const phaseRef = useRef<EntryPhase>("loading");
  const enterButtonRef = useRef<HTMLButtonElement>(null);
  const siteContentRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const initialBypassRef = useRef(false);

  useEffect(() => {
    if (!lenis) return;
    if (phase === "entered" || phase === "bypassed") lenis.start();
    else lenis.stop();
  }, [lenis, phase]);

  const updatePhase = useCallback((next: EntryPhase) => {
    phaseRef.current = next;
    const root = document.documentElement;
    root.dataset.entryState = next === "loading" || next === "ready" ? "required" : next;
    siteContentRef.current?.toggleAttribute("inert", next !== "entered" && next !== "bypassed");
    setPhase(next);
  }, []);

  useLayoutEffect(() => {
    let initialPhase: EntryPhase = "loading";
    try {
      if (window.sessionStorage.getItem(ENTRY_SESSION_KEY) === "1") initialPhase = "bypassed";
    } catch {
      initialPhase = "bypassed";
    }
    const root = document.documentElement;
    root.dataset.entryState = initialPhase === "bypassed" ? "bypassed" : "required";
    siteContentRef.current?.toggleAttribute("inert", initialPhase !== "bypassed");
    if (initialPhase === "bypassed") {
      initialBypassRef.current = true;
      phaseRef.current = "bypassed";
      queueMicrotask(() => setPhase("bypassed"));
    }
  }, []);

  useEffect(() => {
    if (phase === "ready" && document.activeElement === document.body) {
      enterButtonRef.current?.focus({ preventScroll: true });
    }
    if ((phase === "entered" || phase === "bypassed") && openedRef.current) {
      requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }));
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading" || initialBypassRef.current) return;

    let settled = false;
    let frame = 0;
    const becomeReady = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      frame = window.requestAnimationFrame(() => updatePhase("ready"));
    };

    const timeout = window.setTimeout(becomeReady, READY_TIMEOUT);
    document.fonts?.ready.then(becomeReady, becomeReady);

    return () => {
      settled = true;
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [phase, updatePhase]);

  const completeEntry = useCallback(() => {
    if (phaseRef.current !== "opening") return;
    openedRef.current = true;
    updatePhase("entered");
  }, [updatePhase]);

  useEffect(() => {
    if (phase !== "opening") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(completeEntry, reducedMotion ? 24 : OPEN_DURATION + 180);
    return () => window.clearTimeout(timer);
  }, [phase, completeEntry]);

  const enter = () => {
    if (phaseRef.current !== "ready") return;

    lenis?.scrollTo(0, { immediate: true, force: true });

    try {
      window.sessionStorage.setItem(ENTRY_SESSION_KEY, "1");
      updatePhase("opening");
    } catch {
      openedRef.current = true;
      updatePhase("bypassed");
    }
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (event.target === event.currentTarget && event.propertyName === "background-color") completeEntry();
  };

  return (
    <>
      <FinePointerCursor />
      <section
        className={styles.scene}
        data-phase={phase}
        role="dialog"
        aria-modal="true"
        aria-label={content.enterLabel}
        onTransitionEnd={handleTransitionEnd}
      >
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <div className={styles.centerpiece}>
          <p className={styles.loading} role="status" aria-live="polite">{phase === "loading" ? content.loadingLabel : ""}</p>
          <button
            ref={enterButtonRef}
            className={styles.enterButton}
            type="button"
            disabled={phase !== "ready"}
            onClick={enter}
          >
            <span>{content.enterLabel}</span>
          </button>
        </div>
        <p className={styles.hint}>{content.hint}</p>
      </section>
      <div ref={siteContentRef} className={styles.siteContent} data-entry-content>
        {children}
      </div>
    </>
  );
}
