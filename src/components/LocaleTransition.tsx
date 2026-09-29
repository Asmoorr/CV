"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { Locale } from "@/content";
import { animateLocaleText, captureLocaleLayout } from "./localeTextAnimation";
import styles from "./LocaleTransition.module.css";

type LocaleTransitionContextValue = {
  locale: Locale;
  beginLocaleTransition: (locale: Locale) => void;
  busy: boolean;
};

const LocaleTransitionContext = createContext<LocaleTransitionContextValue | null>(null);

export function LocaleTransitionProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, setLocale] = useState(initialLocale);
  const [busy, setBusy] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const running = useRef(false);

  useEffect(() => () => cleanup.current?.(), []);

  const beginLocaleTransition = (next: Locale) => {
    if (running.current || next === locale || !shell.current) return;
    const root = shell.current;
    const before = captureLocaleLayout(root);
    running.current = true;
    flushSync(() => {
      setLocale(next);
      setBusy(true);
    });
    document.documentElement.lang = next;
    cleanup.current = animateLocaleText(root, next, before, () => {
      running.current = false;
      setBusy(false);
      cleanup.current = null;
    });
  };

  return (
    <LocaleTransitionContext.Provider value={{ locale, beginLocaleTransition, busy }}>
      <div ref={shell} className={styles.shell} data-locale-transition={busy ? "scrambling" : "idle"} aria-busy={busy}>
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
