import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.PAGES_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VOIDSWORN — Pact of the Fallen Star",
    short_name: "Voidsworn",
    description: "A cosmic roguelite of pact magic, eldritch invocations and dark bargains.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#0b0716",
    theme_color: "#0b0716",
    icons: [
      { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  };
}
