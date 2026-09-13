import type { ProjectsContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import { TagList } from "../ui/TagList";

export function Projects({ content }: { content: ProjectsContent }) {
  return (
    <section className="section projects-section" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <SectionHeading label={content.label} title={content.title} intro={content.intro} id="projects-heading" />
        <div className="projects-grid">
          {content.items.map((item, index) => (
            <article className={`project ${index === 0 ? "project-featured" : ""}`} key={item.id}>
              <div className="project-index" aria-hidden="true">0{index + 1}</div>
              <p className="project-kind">{item.kind}</p>
              <h3>{item.title}</h3>
              <div className="project-copy">
                <p>{item.problem}</p>
                <p>{item.contribution}</p>
              </div>
              <TagList items={item.technologies} />
              {item.href && item.linkLabel ? (
                <a className="text-link" href={item.href} target="_blank" rel="noreferrer">{item.linkLabel}<span aria-hidden="true">↗</span></a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
