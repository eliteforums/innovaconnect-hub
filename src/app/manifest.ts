import type { MetadataRoute } from "next";
import { event } from "@/content/event";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: event.fullName,
    short_name: event.name,
    description: event.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F5F0E5",
    theme_color: "#F5F0E5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
