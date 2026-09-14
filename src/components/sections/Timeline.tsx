import type { TimelineContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import { TagList } from "../ui/TagList";
import styles from "./Timeline.module.css";

export function Timeline({ content }: { content: TimelineContent }) {
  return (
    <section className={`section ${styles.section}`} id="experience" aria-labelledby="experience-heading">
      <div className="container">
        <SectionHeading label={content.label} title={content.title} intro={content.intro} id="experience-heading" />
        <ol className={styles.timeline}>
          {content.items.map((item) => (
            <li key={item.id} className={styles.entry}>
              <div className={styles.rail}>
                <time>{item.period}</time>
                <span>{item.kind}</span>
              </div>
              <article>
                <div className={styles.topline}>
                  <p>{item.organization}</p>
                  {item.status ? <span className={styles.entryStatus}>{item.status}</span> : null}
                </div>
                <h3>{item.role}</h3>
                <p className={styles.description}>{item.description}</p>
                {item.result ? <p className={styles.result}>{item.result}</p> : null}
                <TagList items={item.technologies} />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
