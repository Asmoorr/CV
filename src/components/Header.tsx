"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, type Locale } from "@/content/locale";
import type { NavigationContent } from "@/content/schema";
import { useLocaleTransition } from "./LocaleTransition";
import styles from "./Header.module.css";

export function Header({ locale, content }: { locale: Locale; content: NavigationContent }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { beginLocaleTransition, busy } = useLocaleTransition();

  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia("(min-width: 901px)");
    const closeAtDesktop = () => { if (media.matches) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    media.addEventListener("change", closeAtDesktop);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", closeAtDesktop);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const localeHref = (nextLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    return segments.join("/");
  };

  return (
    <header className={styles.header}>
      <a className={styles.brand} href="#top">
        {content.brand.split(".")[0]}<span>.</span>{content.brand.split(".")[1]}
      </a>
      <button
        className={styles.menuButton}
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        aria-label={open ? content.menuClose : content.menuOpen}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={open ? styles.lineOpenFirst : ""} />
        <span className={open ? styles.lineOpenSecond : ""} />
      </button>
      <div className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
        <nav id="primary-navigation" aria-label={content.ariaLabel}>
          <ul>
            {content.items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={() => setOpen(false)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.localeSwitch} aria-label={content.languageLabel}>
          {locales.map((item) => (
            <Link
              key={item}
              href={localeHref(item)}
              scroll={false}
              aria-current={locale === item ? "page" : undefined}
              aria-disabled={busy && locale !== item ? true : undefined}
              onClick={() => setOpen(false)}
              onNavigate={(event) => {
                event.preventDefault();
                beginLocaleTransition(localeHref(item));
              }}
            >
              {item.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
