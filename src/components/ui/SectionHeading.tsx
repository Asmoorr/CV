type Props = { label: string; title: string; intro?: string; id: string };

export function SectionHeading({ label, title, intro, id }: Props) {
  return (
    <header className="section-heading">
      <p className="section-kicker">{label}</p>
      <h2 id={id}>{title}</h2>
      {intro ? <p className="section-intro">{intro}</p> : null}
    </header>
  );
}
