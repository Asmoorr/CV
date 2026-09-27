import type { HeroContent } from "@/content/schema";
import { HeroField } from "../HeroField";
import { HeroDissolveItem, HeroTextDissolve } from "../HeroTextDissolve";
import statusStyles from "../ui/Status.module.css";
import styles from "./Hero.module.css";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-name" data-entry-hero data-hero-dissolve>
      <div className={styles.stage}>
        <div className={styles.visualLayer} aria-hidden="true">
          <HeroField />
          <HeroDissolveItem as="div" motionId="orbit-outline" className={`${styles.orbit} ${styles.orbitOne}`} />
          <HeroDissolveItem as="div" motionId="orbit-filled" className={`${styles.orbit} ${styles.orbitTwo}`} />
        </div>
        <div className={styles.content}>
          <HeroTextDissolve as="p" className={styles.greeting} text={content.greeting} />
          <HeroTextDissolve as="h1" id="hero-name" text={content.name} />
          <HeroTextDissolve as="p" className={styles.role} text={content.role} />
          <HeroTextDissolve as="p" className={styles.summary} text={content.summary} />
          <div className={styles.actions}>
            <HeroDissolveItem as="a" motionId="experience" className={`${styles.button} ${styles.primary}`} href="#experience">{content.primaryAction}</HeroDissolveItem>
            <HeroDissolveItem as="a" motionId="contact" className={`${styles.button} ${styles.secondary}`} href="#contact">{content.secondaryAction}</HeroDissolveItem>
          </div>
        </div>
        <div className={styles.meta}>
          <HeroDissolveItem motionId="status" className={statusStyles.status}><i />{content.status}</HeroDissolveItem>
          <HeroDissolveItem motionId="location">{content.location}</HeroDissolveItem>
        </div>
        <ul className={styles.tech} aria-hidden="true">
          {content.technologies.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
