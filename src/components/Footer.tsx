import type { ContactContent, FooterContent, NavigationContent } from "@/content/schema";
import { BackToTop } from "./BackToTop";
import { ResetEntrySession } from "./ResetEntrySession";
import { ArrowUpRight } from "./ui/ArrowUpRight";
import styles from "./Footer.module.css";

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
          {contact.email}<span aria-hidden="true"><ArrowUpRight /></span>
        </a>
      </div>
      <div className={`container ${styles.main}`}>
        <div className={styles.profile}>
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
          <a className={styles.github} href={contact.github}>GitHub <span aria-hidden="true"><ArrowUpRight /></span></a>
          <p>{content.contactNote}</p>
        </div>
      </div>
      <div className={`container ${styles.identity}`}>
        <strong className={styles.name}>{content.name}</strong>
        <div className={styles.controls}>
          <BackToTop label={content.backToTopLabel} />
          <ResetEntrySession label={content.resetEntryLabel} success={content.resetEntrySuccess} error={content.resetEntryError} />
        </div>
      </div>
    </footer>
  );
}
