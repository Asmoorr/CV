import type { FooterContent } from "@/content/schema";
import styles from "./Footer.module.css";
import statusStyles from "./ui/Status.module.css";

export function Footer({ content }: { content: FooterContent }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.main}`}>
        <strong>{content.name}</strong>
        <span className={statusStyles.status}><i />{content.status}</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
      <div className={`container ${styles.meta}`}>
        <span>{content.role} · {content.location}</span>
        <span>{content.signature}</span>
      </div>
    </footer>
  );
}
