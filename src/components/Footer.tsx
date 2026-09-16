"use client";

import { useState } from "react";
import type { FooterContent } from "@/content/schema";
import { ENTRY_SESSION_KEY } from "./entrySession";
import styles from "./Footer.module.css";
import statusStyles from "./ui/Status.module.css";

export function Footer({ content }: { content: FooterContent }) {
  const [notice, setNotice] = useState("");
  const goUp = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
    window.dispatchEvent(new Event("smooth-scroll:reset"));
    const target = document.getElementById("top");
    target?.setAttribute("tabindex", "-1");
    target?.focus({ preventScroll: true });
  };
  const resetEntry = () => {
    try {
      sessionStorage.removeItem(ENTRY_SESSION_KEY);
      setNotice(content.resetEntrySuccess);
    } catch {
      setNotice(content.resetEntryError);
    }
  };
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.main}`}>
        <div><strong>{content.name}</strong><span>{content.role}<br />{content.location}</span></div>
        <span className={statusStyles.status}><i />{content.status}</span>
        <button className={styles.goUp} type="button" onClick={goUp} aria-label={content.backToTop}>
          <span>{content.backToTop}</span>
          <svg viewBox="0 0 62 62" aria-hidden="true"><rect x="1.5" y="1.5" width="59" height="59" /><circle cx="31" cy="31" r="14" /><path d="M31 39V23m-8 8 8-8 8 8" /></svg>
        </button>
      </div>
      <div className={`container ${styles.meta}`}>
        <span>© {new Date().getFullYear()}</span>
        <button type="button" onClick={resetEntry}>{content.resetEntry}</button>
        <span className={styles.notice} role="status" aria-live="polite">{notice}</span>
      </div>
    </footer>
  );
}
