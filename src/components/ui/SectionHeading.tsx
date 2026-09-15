import styles from "./SectionHeading.module.css";

type Props = { label: string; title: string; intro?: string; id: string; number: string; className?: string };

export function SectionHeading({ label, title, intro, id, number, className }: Props) {
  return (
    <header className={`${styles.heading} ${className ?? ""}`}>
      <span className={styles.number} aria-hidden="true">{number}</span>
      <p className={styles.kicker}>{label}</p>
      <h2 id={id}>{title}</h2>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </header>
  );
}
