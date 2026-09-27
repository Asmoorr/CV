"use client";

export function InlineBootstrapScript({ code }: { code: string }) {
  return (
    <script
      id="entry-bootstrap"
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
