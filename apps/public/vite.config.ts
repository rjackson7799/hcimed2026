import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import Sitemap from "vite-plugin-sitemap";

// Dynamically discover blog post slugs for sitemap generation
function getBlogSlugs(): string[] {
  const blogDir = path.resolve(__dirname, "src/content/blog");
  if (!fs.existsSync(blogDir)) return [];
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => `/blog/${f.replace(".md", "")}`);
}

// Area page slugs for sitemap generation
function getAreaSlugs(): string[] {
  return [
    '/areas/pasadena',
    '/areas/altadena',
    '/areas/south-pasadena',
    '/areas/san-marino',
    '/areas/arcadia',
    '/areas/sierra-madre',
    '/areas/la-canada-flintridge',
    '/areas/monrovia',
    '/areas/temple-city',
    '/areas/glendale',
  ];
}

// Dynamically discover newsletter slugs for sitemap generation
function getNewsletterSlugs(): string[] {
  const newsletterDir = path.resolve(__dirname, "src/content/newsletters");
  if (!fs.existsSync(newsletterDir)) return [];
  return fs
    .readdirSync(newsletterDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => `/newsletters/${f.replace(".md", "")}`);
}

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
        "/providers",
        "/providers/dr-jackson",
        "/providers/apple-evangelista",
        "/providers/marileth-tan",
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
        "/programs/medical-weight-loss",
        "/programs/mens-health-trt",
        "/blog",
        ...getBlogSlugs(),
        "/newsletters",
        ...getNewsletterSlugs(),
        ...getAreaSlugs(),
        "/resources",
        "/topics/diabetes-care",
        "/topics/heart-health",
        "/topics/medicare-senior-services",
        "/topics/preventive-care",
      ],
      changefreq: "monthly",
      priority: 0.8,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hci/shared": path.resolve(__dirname, "../../packages/shared"),
    },
  },
});
