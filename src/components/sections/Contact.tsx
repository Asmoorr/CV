import type { ContactContent } from "@/content/schema";
import statusStyles from "../ui/Status.module.css";
import styles from "./Contact.module.css";

export function Contact({ content }: { content: ContactContent }) {
  const phoneHref = `tel:${content.phone.replace(/[^+\d]/g, "")}`;
  return (
    <section className={`section ${styles.section}`} id="contact" aria-labelledby="contact-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={styles.kicker}>{content.label}</p>
          <h2 id="contact-heading">{content.title.lead}<br /><span>{content.title.accent}</span></h2>
          <p className={styles.description}>{content.description}</p>
          <p className={statusStyles.status}><i />{content.status}</p>
        </div>
        <div className={styles.links}>
          <a href={`mailto:${content.email}`}><span>{content.emailLabel}</span><strong>{content.email}</strong><i aria-hidden="true">↗</i></a>
          <a href={phoneHref}><span>{content.phoneLabel}</span><strong>{content.phone}</strong><i aria-hidden="true">↗</i></a>
          <a href={content.github} target="_blank" rel="noreferrer"><span>{content.githubLabel}</span><strong>{content.github.replace(/^https?:\/\//, "")}</strong><i aria-hidden="true">↗</i></a>
          <div className={styles.location}><span>{content.locationLabel}</span><strong>{content.location}</strong></div>
          <p>{content.responseTime}</p>
        </div>
      </div>
    </section>
  );
}
