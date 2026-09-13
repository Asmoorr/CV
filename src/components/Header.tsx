"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale, NavigationContent } from "@/content/schema";

export function Header({ locale, content }: { locale: Locale; content: NavigationContent }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const localeHref = (nextLocale: Locale) => {
    const rest = pathname.replace(/^\/(ru|en)/, "");
    return `/${nextLocale}${rest}`;
  };

  return (
    <header className="site-header">
      <a className="brand" href="#top">
        {content.brand.split(".")[0]}<span>.</span>{content.brand.split(".")[1]}
      </a>
      <button
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        aria-label={open ? content.menuClose : content.menuOpen}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
      </button>
      <div className={`header-panel ${open ? "is-open" : ""}`}>
        <nav id="primary-navigation" aria-label={content.ariaLabel}>
          <ul>
            {content.items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={() => setOpen(false)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="locale-switch" aria-label={content.languageLabel}>
          {(["ru", "en"] as Locale[]).map((item) => (
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
