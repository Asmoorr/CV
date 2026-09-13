import type { TimelineContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";
import { TagList } from "../ui/TagList";

export function Timeline({ content }: { content: TimelineContent }) {
  return (
    <section className="section timeline-section" id="experience" aria-labelledby="experience-heading">
      <div className="container">
        <SectionHeading label={content.label} title={content.title} intro={content.intro} id="experience-heading" />
        <ol className="timeline">
          {content.items.map((item) => (
            <li key={item.id} className="timeline-entry">
              <div className="timeline-rail">
                <time>{item.period}</time>
                <span>{item.kind}</span>
              </div>
              <article>
                <div className="timeline-topline">
                  <p>{item.organization}</p>
                  {item.status ? <span className="entry-status">{item.status}</span> : null}
                </div>
                <h3>{item.role}</h3>
                <p className="timeline-description">{item.description}</p>
                {item.result ? <p className="timeline-result">{item.result}</p> : null}
                <TagList items={item.technologies} />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
