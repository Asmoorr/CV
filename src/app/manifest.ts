import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Artyom Trikula CV",
    short_name: "Artyom CV",
    description: "Backend developer portfolio and CV",
    start_url: "/ru",
    display: "standalone",
    background_color: "#0d0f10",
    theme_color: "#0d0f10",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
