export default function manifest() {
  return {
    name: "My-Team Sports",
    short_name: "My-Team",
    description:
      "Your team's roster, schedule, live scores, stats, photos and film — free, no app store needed.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
