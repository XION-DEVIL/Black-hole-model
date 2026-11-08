import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { fileURLToPath, URL } from "node:url";

// Static hosting build (GitHub Pages / GitLab Pages):
// e.g. `STATIC_PAGES=true PAGES_BASE=/<path>/ bun run build` or `GITHUB_PAGES=true`
const isStaticPages =
  process.env["STATIC_PAGES"] === "true" ||
  process.env["GITHUB_PAGES"] === "true" ||
  process.env["CI_PAGES_URL"] !== undefined;
const pagesBase = normalizeBase(process.env["PAGES_BASE"] ?? "/");

function normalizeBase(base: string) {
  let b = base.trim() || "/";
  if (!b.startsWith("/")) b = `/${b}`;
  if (!b.endsWith("/")) b = `${b}/`;
  return b;
}

export default defineConfig({
  base: isStaticPages ? pagesBase : "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    tanstackStart(
      isStaticPages
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
