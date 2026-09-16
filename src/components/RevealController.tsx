"use client";

import { useEffect } from "react";

export function RevealController() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const root = document.documentElement;
    root.dataset.revealReady = "true";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => { element.dataset.revealed = "true"; });
      return () => { delete root.dataset.revealReady; };
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -10%", threshold: .08 });
    elements.forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); delete root.dataset.revealReady; };
  }, []);
  return null;
}
