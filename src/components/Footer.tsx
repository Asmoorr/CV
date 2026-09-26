import type { FooterContent } from "@/content/schema";
import { BackToTop } from "./BackToTop";
import { ResetEntrySession } from "./ResetEntrySession";
import styles from "./Footer.module.css";
import statusStyles from "./ui/Status.module.css";

export function Footer({ content }: { content: FooterContent }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.main}`}>
        <div className={styles.identity}>
          <strong>{content.name}</strong>
          <span className={statusStyles.status}><i />{content.status}</span>
        </div>
        <div className={styles.actions}>
          <span className={styles.year}>© {new Date().getFullYear()}</span>
          <BackToTop label={content.backToTopLabel} />
        </div>
      </div>
      <div className={`container ${styles.meta}`}>
        <span>{content.role} · {content.location}</span>
        <div className={styles.signatureTools}>
          <span>{content.signature}</span>
          <ResetEntrySession label={content.resetEntryLabel} success={content.resetEntrySuccess} error={content.resetEntryError} />
        </div>
      </div>
    </footer>
  );
}
