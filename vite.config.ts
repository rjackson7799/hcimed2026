import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import Sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    Sitemap({
      hostname: "https://hcimed.com",
      dynamicRoutes: [
        "/",
        "/our-story",
        "/contact",
        "/faq",
        "/appointments",
        "/careers",
        "/insurance-update",
        "/senior-care-plus",
        "/internal-medicine/physical-exams",
        "/internal-medicine/acute-care",
        "/internal-medicine/womens-health",
        "/internal-medicine/mens-health",
        "/internal-medicine/diagnostics",
        "/senior-care/prevention-wellness",
        "/senior-care/chronic-care",
        "/senior-care/transition-care",
        "/senior-care/remote-monitoring",
        "/blog",
      ],
      changefreq: "monthly",
      priority: 0.8,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
