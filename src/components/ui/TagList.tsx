import styles from "./TagList.module.css";

export function TagList({ items }: { items: string[] }) {
  return (
    <ul className={styles.list} aria-label="Technologies">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}
