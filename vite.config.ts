import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { fileURLToPath, URL } from "node:url";

// GitHub Pages build: `GITHUB_PAGES=true PAGES_BASE=/<repo>/ bun run build`.
const isGithubPages = process.env["GITHUB_PAGES"] === "true";
const pagesBase = normalizeBase(process.env["PAGES_BASE"] ?? "/");

function normalizeBase(base: string) {
  let b = base.trim() || "/";
  if (!b.startsWith("/")) b = `/${b}`;
  if (!b.endsWith("/")) b = `${b}/`;
  return b;
}

export default defineConfig({
  base: isGithubPages ? pagesBase : "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    tanstackStart(
      isGithubPages
        ? {
            server: { entry: "server" },
            router: { basepath: pagesBase },
            pages: [{ path: "/" }, { path: "/contact" }],
            prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false },
          }
        : { server: { entry: "server" } },
    ),
    react(),
    tailwindcss(),
  ],
});
