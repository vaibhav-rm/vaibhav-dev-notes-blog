import { Helmet } from "react-helmet"
import site, {
  SITE_DESCRIPTION,
  SITE_LANG,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  postUrl,
} from "../config/site"

/**
 * Single source of truth for every `<head>` tag on the site.
 *
 * Every canonical URL is derived from SITE_URL — never from
 * `window.location.href`, which would bake in query strings, hashes,
 * preview hostnames and the http/https scheme into the canonical tag.
 */
export default function SEO({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image,
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  schema,
  children,
}) {
  const canonical = absoluteUrl(path)
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_DESCRIPTION}`
  const ogImage = image ? absoluteUrl(image) : site.ogImage
  const robots = noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"

  return (
    <Helmet prioritizeSeoTags htmlAttributes={{ lang: SITE_LANG }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robots} />
      <meta name="author" content={author || site.author} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title || SITE_NAME} />

      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && <meta property="article:author" content={author} />}
      {type === "article" && section && <meta property="article:section" content={section} />}
      {type === "article" &&
        Array.isArray(tags) &&
        tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}

      {children}
    </Helmet>
  )
}

export { SITE_URL, SITE_NAME, postUrl }
