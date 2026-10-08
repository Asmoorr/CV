import { useEffect, useRef } from "react";
import type { ContactContent } from "@/content/schema";
import { ContactForm } from "./ContactForm";
import { ArrowUpRight } from "../ui/ArrowUpRight";
import styles from "./Contact.module.css";

export function Contact({ content }: { content: ContactContent }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const phoneHref = `tel:${content.phone.replace(/[^+\d]/g, "")}`;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof IntersectionObserver === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      grid.dataset.contactRevealed = "true";
      if (motion.matches) return;
      const elements = grid.querySelectorAll<HTMLElement>("[data-contact-reveal]");
      elements.forEach((element, index) => {
        animations.push(element.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 420, delay: index * 65, easing: "cubic-bezier(.22, 1, .36, 1)" },
        ));
      });
    }, { threshold: .12 });
    observer.observe(grid);
    const handleMotionChange = () => {
      if (motion.matches) animations.forEach((animation) => animation.cancel());
    };
    motion.addEventListener("change", handleMotionChange);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      motion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <section className={`section ${styles.section}`} id="contact" aria-labelledby="contact-heading">
      <div ref={gridRef} className={styles.grid}>
        <ContactForm content={content.form} />
        <div className={styles.intro} data-contact-reveal>
          <p className={styles.kicker}>{content.label}</p>
          <h2 id="contact-heading">{content.title.lead}<br /><span>{content.title.accent}</span></h2>
          <p className={styles.description}>{content.description}</p>
        </div>
        <div className={styles.links} data-contact-reveal>
          <a href={`mailto:${content.email}`}><span>{content.emailLabel}</span><strong>{content.email}</strong><i aria-hidden="true"><ArrowUpRight /></i></a>
          <a href={phoneHref}><span>{content.phoneLabel}</span><strong>{content.phone}</strong><i aria-hidden="true"><ArrowUpRight /></i></a>
          <a href={content.github} target="_blank" rel="noreferrer"><span>{content.githubLabel}</span><strong>{content.github.replace(/^https?:\/\//, "")}</strong><i aria-hidden="true"><ArrowUpRight /></i></a>
          <div className={styles.location}><span>{content.locationLabel}</span><strong>{content.location}</strong></div>
          <p>{content.responseTime}</p>
        </div>
      </div>
    </section>
  );
}
