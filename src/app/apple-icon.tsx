import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 36,
        color: "#f4f7f8",
        background: "#0d0f10",
        fontSize: 94,
        fontWeight: 800,
        fontFamily: "Arial, sans-serif",
      }}
    >
      A<span style={{ color: "#48c7f4" }}>.</span>
    </div>,
    size,
  );
}
