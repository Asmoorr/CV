import styles from "./TagList.module.css";
import type { ContentTag } from "@/content/schema";

export function TagList({ items }: { items: ContentTag[] }) {
  return (
    <ul className={styles.list} aria-label="Project attributes">
      {items.map((item) => <li className={styles[item.category]} key={`${item.category}-${item.label}`}>{item.label}</li>)}
    </ul>
  );
}
