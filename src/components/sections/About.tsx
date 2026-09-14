import type { AboutContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import styles from "./About.module.css";

export function About({ content }: { content: AboutContent }) {
  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <div className={`container ${styles.grid}`}>
        <SectionHeading className={styles.heading} label={content.label} title={content.title} id="about-heading" />
        <div className={styles.copy}>
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <dl className={styles.facts}>
          {content.facts.map((fact) => (
            <div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}
