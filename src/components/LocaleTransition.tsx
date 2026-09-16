"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const pendingPath = useRef<string | null>(null);
  const exitTimer = useRef<number>(0);
  const settleTimer = useRef<number>(0);

  const beginLocaleTransition = useCallback((href: string) => {
    if (phase !== "idle" || href === pathname) return;

    pendingPath.current = href;
    setPhase("exiting");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    exitTimer.current = window.setTimeout(() => {
      document.documentElement.classList.add("is-wheel-scrolling");
      window.scrollTo({ top: 0, behavior: "instant" });
      window.dispatchEvent(new Event("smooth-scroll:reset"));
      setPhase("waiting");
      router.push(href, { scroll: false });
    }, reducedMotion ? 0 : 150);
  }, [pathname, phase, router]);

  useEffect(() => {
    if (!pendingPath.current || pathname !== pendingPath.current) return;

    pendingPath.current = null;
    document.documentElement.classList.remove("is-wheel-scrolling");
    const frame = requestAnimationFrame(() => setPhase("entering"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    settleTimer.current = window.setTimeout(() => setPhase("idle"), reducedMotion ? 0 : 220);

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => () => {
    window.clearTimeout(exitTimer.current);
    window.clearTimeout(settleTimer.current);
    document.documentElement.classList.remove("is-wheel-scrolling");
  }, []);

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
