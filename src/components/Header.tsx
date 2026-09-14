"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { locales, type Locale } from "@/content/locale";
import type { NavigationContent } from "@/content/schema";
import styles from "./Header.module.css";

export function Header({ locale, content }: { locale: Locale; content: NavigationContent }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
        <span />
        <span />
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
              aria-current={locale === item ? "page" : undefined}
              onClick={(event) => {
                const hash = window.location.hash;
                if (hash) event.currentTarget.href = `${localeHref(item)}${hash}`;
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
