"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { TimelineContent, TimelineItem } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import styles from "./Timeline.module.css";

const SCALE_START = 2024 * 12;
const SCALE_MONTHS = 60;

function monthIndex(value: `${number}-${number}` | null) {
  if (!value) {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month - 1;
}

function rangeStyle(item: TimelineItem, index: number): CSSProperties {
  const start = Math.max(0, monthIndex(item.start) - SCALE_START);
  const end = Math.min(SCALE_MONTHS, monthIndex(item.end) - SCALE_START + 1);
  return {
    "--range-start": `${(start / SCALE_MONTHS) * 100}%`,
    "--range-width": `${(Math.max(1, end - start) / SCALE_MONTHS) * 100}%`,
    "--range-delay": `${index * 90}ms`,
  } as CSSProperties;
}

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  return (
    <li className={styles.entry}>
      <article>
        <div className={styles.topline}>
          <p>{item.organization}</p>
          {item.status ? <span className={styles.entryStatus}>{item.status}</span> : null}
        </div>
        <h3>{item.role}</h3>
        <p className={styles.description}>{item.description}</p>
      </article>
      <div className={styles.plot} aria-hidden="true">
        <span className={styles.range} style={rangeStyle(item, index)} />
      </div>
      <div className={styles.meta}>
        <time>{item.period}</time>
        <span>{item.kind}</span>
      </div>
    </li>
  );
}

export function Timeline({ content }: { content: TimelineContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: .16 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const education = content.items.filter((item) => item.track === "education");
  const work = content.items.filter((item) => item.track === "work");

  return (
    <section className={`section ${styles.section}`} id="experience" aria-labelledby="experience-heading">
      <div className="container">
        <div data-reveal><SectionHeading label={content.label} title={content.title} intro={content.intro} id="experience-heading" number="02" /></div>
        <div ref={ref} data-reveal className={`${styles.timeline} ${revealed ? styles.revealed : ""}`}>
          <div className={styles.ruler} aria-hidden="true">
            {[2024, 2025, 2026, 2027, 2028].map((year) => <span key={year}>{year}</span>)}
          </div>
          <ol className={styles.entries}>
            {[...education, ...work].map((item, index) => <TimelineEntry item={item} index={index} key={item.id} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}
