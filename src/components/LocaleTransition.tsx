"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import styles from "./LocaleTransition.module.css";

type TransitionPhase = "idle" | "exiting" | "waiting" | "entering";

type LocaleTransitionContextValue = {
  beginLocaleTransition: (href: string) => void;
  busy: boolean;
};

const LocaleTransitionContext = createContext<LocaleTransitionContextValue | null>(null);

export function LocaleTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const pendingPath = useRef<string | null>(null);
  const exitTimer = useRef<number>(0);
  const settleTimer = useRef<number>(0);

  const beginLocaleTransition = useCallback((href: string) => {
    if (phase !== "idle" || href === pathname) return;

    pendingPath.current = href;
    setPhase("exiting");
    lenis?.stop();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    exitTimer.current = window.setTimeout(() => {
      lenis?.scrollTo(0, { immediate: true, force: true });
      setPhase("waiting");
      router.push(href, { scroll: false });
    }, reducedMotion ? 0 : 150);
  }, [lenis, pathname, phase, router]);

  useEffect(() => {
    if (!pendingPath.current || pathname !== pendingPath.current) return;

    pendingPath.current = null;
    lenis?.scrollTo(0, { immediate: true, force: true });
    lenis?.start();
    const frame = requestAnimationFrame(() => setPhase("entering"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    settleTimer.current = window.setTimeout(() => setPhase("idle"), reducedMotion ? 0 : 220);

    return () => cancelAnimationFrame(frame);
  }, [lenis, pathname]);

  useEffect(() => () => {
    window.clearTimeout(exitTimer.current);
    window.clearTimeout(settleTimer.current);
    lenis?.start();
  }, [lenis]);

  return (
    <LocaleTransitionContext.Provider value={{ beginLocaleTransition, busy: phase !== "idle" }}>
      <div className={styles.shell} data-locale-transition={phase} aria-busy={phase !== "idle"}>
        {children}
      </div>
    </LocaleTransitionContext.Provider>
  );
}

export function LocaleTransitionSurface({ children }: { children: ReactNode }) {
  return <div className={styles.surface}>{children}</div>;
}

export function useLocaleTransition() {
  const context = useContext(LocaleTransitionContext);
  if (!context) throw new Error("useLocaleTransition must be used within LocaleTransitionProvider");
  return context;
}
