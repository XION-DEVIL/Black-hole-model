# Halcyon Sound Lab (demo site)

## Publish on GitHub Pages

1. In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (or run the "Deploy to GitHub Pages" workflow by hand).

The site appears at `https://<user>.github.io/<repo>/`. For a custom domain, add `public/CNAME` containing the domain.

Local static build: `GITHUB_PAGES=true PAGES_BASE=/<repo>/ bunx vite build` → `dist/client`.
