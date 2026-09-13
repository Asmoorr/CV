import type { HeroContent } from "@/content/schema";
import { HeroField } from "../HeroField";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-name">
      <HeroField />
      <div className="hero-orbit orbit-one" aria-hidden="true" />
      <div className="hero-orbit orbit-two" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-greeting">{content.greeting}</p>
        <h1 id="hero-name">{content.name}</h1>
        <p className="hero-role">{content.role}</p>
        <p className="hero-summary">{content.summary}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#experience">{content.primaryAction}</a>
          <a className="button button-secondary" href="#contact">{content.secondaryAction}</a>
        </div>
      </div>
      <div className="hero-meta">
        <span className="status"><i />{content.status}</span>
        <span>{content.location}</span>
      </div>
      <ul className="hero-tech" aria-hidden="true">
        {content.technologies.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
