import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Styven Raya — Portfolio",
    short_name: "Styven Raya",
    description:
      "Portfolio de Styven Raya, développeur web Next.js & TypeScript.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#dc2626",
    lang: "fr",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
