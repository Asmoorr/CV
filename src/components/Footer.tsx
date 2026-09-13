import type { FooterContent } from "@/content/schema";

export function Footer({ content }: { content: FooterContent }) {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <strong>{content.name}</strong>
        <span className="status"><i />{content.status}</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
      <div className="container footer-meta">
        <span>{content.role} · {content.location}</span>
        <span>{content.signature}</span>
      </div>
    </footer>
  );
}
