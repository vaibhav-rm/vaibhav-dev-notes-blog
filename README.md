# Vaibhav Notes

A blog built with React 18 + Vite on an Appwrite backend, deployed to Cloudflare Pages.

## Local development

```bash
npm install
cp .env.example .env   # then fill in your Appwrite ids
npm run dev
```

## Build

```bash
npm run lint    # must be clean
npm run build   # generates sitemap.xml / rss.xml / robots.txt, then bundles
npm run preview
```

`scripts/generate-seo.js` runs before `vite build` and reads `.env` directly, because
Vite only exposes `VITE_`-prefixed variables to the browser bundle.

## Environment variables

Set these in `.env` locally **and** in the Cloudflare Pages dashboard
(Settings → Environment variables). `.env` is gitignored, so a missing dashboard
variable silently degrades the site.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Canonical origin, **no trailing slash**. Single source of truth for every canonical URL, `og:url`, sitemap and feed entry. |
| `VITE_APPWRITE_URL` | Appwrite endpoint, e.g. `https://cloud.appwrite.io/v1` |
| `VITE_PROJECT_ID` | Appwrite project id |
| `VITE_DATABASE_ID` | Database id |
| `VITE_COLLECTION_ID` | Posts collection id |
| `VITE_COMMENTS_COLLECTION_ID` | Comments collection id |
| `VITE_BUCKET_ID` | Storage bucket id |
| `VITE_FUNCTION_ID` | Cloud function id |
| `VITE_EDITOR_API` | TinyMCE API key |
| `VITE_GA_MEASUREMENT_ID` | GA4 id. Unset ⇒ analytics is fully disabled. |
| `APPWRITE_API_KEY` | Build-script only. Needed **only** if the posts collection is not publicly readable. |

### Changing the domain

`VITE_SITE_URL` is the one value to change. Also update the hard-coded
`https://vaibhavnotes.pages.dev` fallbacks in `index.html`, and re-deploy. The
sitemap, feed and robots.txt are regenerated from `VITE_SITE_URL` on every build.

## SEO architecture

- `src/config/site.js` owns the canonical origin, site metadata and helpers
  (`excerpt`, `readingTime`, `postUrl`).
- `src/Components/SEO.jsx` is the only place `<head>` tags are declared. Pages
  call it; nothing else touches `react-helmet` directly.
- **Never derive a canonical from `window.location.href`** — it bakes in query
  strings, fragments and preview hostnames.
- Every static tag in `index.html` that the client overrides carries
  `data-react-helmet="true"`. Without it `react-helmet` appends a second tag and
  the page ends up with two conflicting canonicals.
- Loading/auth-gated states render `noindex` so a crawler that catches one
  mid-load never indexes the wrong URL.

## Keeping the sitemap honest

`SEO_STRICT=true npm run build` fails the build when zero posts are written to
`public/sitemap.xml`. Use it in CI — a silently empty sitemap is the failure mode
that silently de-indexes a blog.

## Appwrite projects pause when idle

A paused project returns `403 project_paused` for every request, which makes the
blog render empty for visitors *and* crawlers. Check the Appwrite console if posts
suddenly disappear.