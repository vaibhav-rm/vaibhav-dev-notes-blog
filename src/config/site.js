const rawSiteUrl = String(import.meta.env.VITE_SITE_URL || "https://vaibhavnotes.pages.dev").trim()

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "")

export const SITE_NAME = "Vaibhav Notes"
export const SITE_AUTHOR = "Vaibhav"
export const SITE_LOCALE = "en_US"
export const SITE_LANG = "en"

export const SITE_DESCRIPTION =
  "Practical engineering notes on backend architecture, Linux, DevOps and React — written by Vaibhav."

export const OG_IMAGE = `${SITE_URL}/og-image.png`
export const LOGO_IMAGE = `${SITE_URL}/logo.png`
export const RSS_URL = `${SITE_URL}/rss.xml`

export const absoluteUrl = (path = "/") => {
  if (!path) return `${SITE_URL}/`
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export const postUrl = (slug) => `${SITE_URL}/post/${slug}`

export const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()

export const excerpt = (html = "", maxLength = 158) => {
  const text = stripHtml(html)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`
}

export const readingTime = (html = "") => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export const site = {
  url: SITE_URL,
  name: SITE_NAME,
  author: SITE_AUTHOR,
  locale: SITE_LOCALE,
  lang: SITE_LANG,
  description: SITE_DESCRIPTION,
  ogImage: OG_IMAGE,
  logo: LOGO_IMAGE,
  rss: RSS_URL,
}

export default site
