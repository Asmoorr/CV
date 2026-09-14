import type { SkillsContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import styles from "./Skills.module.css";

export function Skills({ content }: { content: SkillsContent }) {
  return (
    <section className="section" id="skills" aria-labelledby="skills-heading">
      <div className={`container ${styles.layout}`}>
        <SectionHeading className={styles.heading} label={content.label} title={content.title} id="skills-heading" />
        <div className={styles.core}>
          <p>{content.coreLabel}</p>
          <ul>{content.core.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className={styles.groups}>
          {content.groups.map((group) => (
            <article key={group.id}>
              <h3>{group.title}</h3>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
