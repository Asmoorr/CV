import type { HeroContent } from "@/content/schema";
import { HeroField } from "../HeroField";
import statusStyles from "../ui/Status.module.css";
import styles from "./Hero.module.css";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-name">
      <HeroField />
      <div className={`${styles.orbit} ${styles.orbitOne}`} aria-hidden="true" />
      <div className={`${styles.orbit} ${styles.orbitTwo}`} aria-hidden="true" />
      <div className={styles.content} data-hero-content>
        <p className={styles.greeting}>{content.greeting}</p>
        <h1 id="hero-name">{content.name}</h1>
        <p className={styles.role}>{content.role}</p>
        <p className={styles.summary}>{content.summary}</p>
        <div className={styles.actions}>
          <a className={`${styles.button} ${styles.primary}`} href="#experience">{content.primaryAction}</a>
          <a className={`${styles.button} ${styles.secondary}`} href="#contact">{content.secondaryAction}</a>
        </div>
      </div>
      <div className={styles.meta}>
        <span className={statusStyles.status}><i />{content.status}</span>
        <span>{content.location}</span>
      </div>
      <ul className={styles.tech} aria-hidden="true">
        {content.technologies.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[0, 1].map((group) => (
            <div className={styles.marqueeGroup} key={group}>
              {Array.from({ length: 5 }, (_, index) => <span className={index % 2 === 0 ? styles.outline : ""} key={index}>{content.scrollPrompt}</span>)}
            </div>
          ))}
        </div>
      </div>
      <a className={styles.scrollPrompt} href="#about">{content.scrollPrompt}</a>
    </section>
  );
}
