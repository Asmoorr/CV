import type { ContactContent } from "@/content/schema";

export function Contact({ content }: { content: ContactContent }) {
  const phoneHref = `tel:${content.phone.replace(/[^+\d]/g, "")}`;
  return (
    <section className="section contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="container contact-grid">
        <div>
          <p className="section-kicker">{content.label}</p>
          <h2 id="contact-heading">{content.title}</h2>
          <p className="contact-description">{content.description}</p>
          <p className="status"><i />{content.status}</p>
        </div>
        <div className="contact-links">
          <a href={`mailto:${content.email}`}><span>{content.emailLabel}</span><strong>{content.email}</strong><i aria-hidden="true">↗</i></a>
          <a href={phoneHref}><span>{content.phoneLabel}</span><strong>{content.phone}</strong><i aria-hidden="true">↗</i></a>
          <a href={content.github} target="_blank" rel="noreferrer"><span>{content.githubLabel}</span><strong>{content.github.replace(/^https?:\/\//, "")}</strong><i aria-hidden="true">↗</i></a>
          <div className="contact-location"><span>{content.locationLabel}</span><strong>{content.location}</strong></div>
          <p>{content.responseTime}</p>
        </div>
      </div>
    </section>
  );
}
