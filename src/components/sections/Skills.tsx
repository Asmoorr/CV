import type { SkillsContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";

export function Skills({ content }: { content: SkillsContent }) {
  return (
    <section className="section skills-section" id="skills" aria-labelledby="skills-heading">
      <div className="container skills-layout">
        <SectionHeading label={content.label} title={content.title} id="skills-heading" />
        <div className="core-stack">
          <p>{content.coreLabel}</p>
          <ul>{content.core.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="skill-groups">
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
