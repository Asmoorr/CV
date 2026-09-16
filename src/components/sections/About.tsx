import type { AboutContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import styles from "./About.module.css";

export function About({ content }: { content: AboutContent }) {
  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.heading} data-reveal><SectionHeading label={content.label} title={content.title} id="about-heading" number="01" /></div>
        <div className={styles.copy} data-reveal>
          {content.blocks.map((block) => <article key={block.id}><h3>{block.title}</h3><p>{block.text}</p></article>)}
        </div>
        <dl className={styles.facts} data-reveal>
          {content.facts.map((fact) => (
            <div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}
