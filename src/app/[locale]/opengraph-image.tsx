import { ImageResponse } from "next/og";
import { content, isLocale } from "@/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resume = content[isLocale(locale) ? locale : "ru"];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 84px",
        color: "#f4f7f8",
        background: "#0d0f10",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 28, color: "#48c7f4" }}>
        <div style={{ width: 16, height: 16, borderRadius: 999, background: "#48c7f4" }} />
        PORTFOLIO · 2026
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 78, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-3px" }}>{resume.hero.name}</div>
        <div style={{ fontSize: 42, color: "#c9d3d7" }}>{resume.hero.role}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 25, color: "#8f9ba0" }}>
        <span>Python · API · PostgreSQL · Data platforms</span>
        <span>artem-trikula.ru</span>
      </div>
    </div>,
    size,
  );
}
