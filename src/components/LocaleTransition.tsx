"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { localeTransitionCoordinator } from "./localeTransitionCoordinator";
import styles from "./LocaleTransition.module.css";

type LocaleTransitionContextValue = {
  beginLocaleTransition: (href: string) => void;
  busy: boolean;
};

const LocaleTransitionContext = createContext<LocaleTransitionContextValue | null>(null);

export function LocaleTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const [phase, setPhase] = useState(localeTransitionCoordinator.getPhase);

  useEffect(() => localeTransitionCoordinator.subscribe(setPhase), []);

  const beginLocaleTransition = useCallback((href: string) => {
    if (localeTransitionCoordinator.getPhase() !== "idle" || href === pathname) return;
    lenis?.stop();
    const started = localeTransitionCoordinator.begin(pathname, href, () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      lenis?.scrollTo(0, { immediate: true, force: true });
      router.push(href, { scroll: false });
    }, () => lenis?.start());
    if (!started) lenis?.start();
  }, [lenis, pathname, router]);

  useEffect(() => {
    const expected = localeTransitionCoordinator.expectedPath();
    if (!expected || expected === pathname || pathname === localeTransitionCoordinator.sourcePath()) return;
    localeTransitionCoordinator.abort();
    lenis?.start();
  }, [lenis, pathname, phase]);

  useEffect(() => {
    if (phase !== "waiting" || pathname !== localeTransitionCoordinator.expectedPath() || !lenis) return;
    let frame = 0;
    const revealWhenReady = () => {
      const entryState = document.documentElement.dataset.entryState;
      if (entryState !== "entered" && entryState !== "bypassed") {
        frame = requestAnimationFrame(revealWhenReady);
        return;
      }
      localeTransitionCoordinator.enter(pathname, () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.start();
      });
    };
    frame = requestAnimationFrame(revealWhenReady);
    return () => cancelAnimationFrame(frame);
  }, [lenis, pathname, phase]);

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
