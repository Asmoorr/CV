import type { ContactContent, FooterContent, NavigationContent } from "@/content/schema";
import { BackToTop } from "./BackToTop";
import { ResetEntrySession } from "./ResetEntrySession";
import styles from "./Footer.module.css";
import statusStyles from "./ui/Status.module.css";

export function Footer({ content, contact, navigation }: {
  content: FooterContent;
  contact: ContactContent;
  navigation: NavigationContent;
}) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.heading}`}>
        <p className={styles.role}>{content.role}</p>
        <p className={styles.specialty}>{content.specialty}</p>
        <a className={styles.email} href={`mailto:${contact.email}`}>
          {contact.email}<span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className={`container ${styles.main}`}>
        <div className={styles.profile}>
          <span className={statusStyles.status}><i />{content.status}</span>
          <p>{contact.location}</p>
        </div>
        <nav className={styles.navigation} aria-label={content.navigationLabel}>
          <ul>
            {navigation.items.map((item) => (
              <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className={styles.contacts}>
          <a className={styles.phone} href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>
          <a className={styles.github} href={contact.github}>GitHub <span aria-hidden="true">↗</span></a>
          <p>{content.contactNote}</p>
        </div>
      </div>
      <div className={`container ${styles.identity}`}>
        <strong className={styles.name}>{content.name}</strong>
        <BackToTop label={content.backToTopLabel} />
      </div>
      <div className={`container ${styles.meta}`}>
        <span>© {new Date().getFullYear()} · {content.location}</span>
        <div className={styles.signatureTools}>
          <span>{content.signature}</span>
          <ResetEntrySession label={content.resetEntryLabel} success={content.resetEntrySuccess} error={content.resetEntryError} />
        </div>
      </div>
    </footer>
  );
}
