import type { AboutContent } from "@/content/schema";
import { SectionHeading } from "../ui/SectionHeading";

export function About({ content }: { content: AboutContent }) {
  return (
    <section className="section about" id="about" aria-labelledby="about-heading">
      <div className="container about-grid">
        <SectionHeading label={content.label} title={content.title} id="about-heading" />
        <div className="about-copy">
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <dl className="facts">
          {content.facts.map((fact) => (
            <div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}
