import type { ProjectsContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import { TagList } from "../ui/TagList";
import styles from "./Projects.module.css";

export function Projects({ content }: { content: ProjectsContent }) {
  return (
    <section className="section" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <div data-reveal><SectionHeading label={content.label} title={content.title} intro={content.intro} id="projects-heading" number="03" /></div>
        <div className={styles.grid} data-reveal>
          {content.items.map((item, index) => (
            <article className={`${styles.project} ${index === 0 ? styles.featured : ""}`} key={item.id}>
              <div className={styles.index} aria-hidden="true">0{index + 1}</div>
              <p className={styles.kind}>{item.kind}</p>
              <h3>{item.title}</h3>
              <div className={styles.copy}>
                <p>{item.problem}</p>
                <p>{item.contribution}</p>
                <p className={styles.result}>{item.result}</p>
              </div>
              <TagList items={item.tags} />
              {item.href && item.linkLabel ? (
                <a className={styles.link} href={item.href} target="_blank" rel="noreferrer">{item.linkLabel}<span aria-hidden="true">↗</span></a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
