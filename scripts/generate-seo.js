import fs from 'fs'
import path from 'path'

// Vite only exposes VITE_-prefixed vars to the client, and .env is gitignored, so
// the build script reads .env directly to get the same values.
const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (!parts) continue
    const [, key, rawValue] = parts
    let value = rawValue || ''
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnv()

const appwriteUrl = process.env.VITE_APPWRITE_URL
const projectId = process.env.VITE_PROJECT_ID
const databaseId = process.env.VITE_DATABASE_ID
const collectionId = process.env.VITE_COLLECTION_ID
const bucketId = process.env.VITE_BUCKET_ID
const appwriteKey = process.env.APPWRITE_API_KEY

// Single source of truth for the canonical origin. Keep in sync with
// VITE_SITE_URL, which the runtime reads from src/config/site.js.
const SITE_URL = (process.env.VITE_SITE_URL || 'https://vaibhavnotes.pages.dev').replace(/\/+$/, '')

const STRICT = process.env.SEO_STRICT === 'true'

const toDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

const escapeXml = (unsafe) =>
  String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const stripHtml = (html) =>
  String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

const escapeCdata = (value) => String(value ?? '').replace(/]]>/g, ']]]]><![CDATA[>')

async function fetchPosts() {
  if (!appwriteUrl || !projectId || !databaseId || !collectionId) {
    console.warn('[SEO] Appwrite env vars missing — emitting static routes only.')
    return []
  }

  const url = `${appwriteUrl}/databases/${databaseId}/collections/${collectionId}/documents`

  // Public-read collections need no key; private ones need a server-side key.
  const headers = { 'X-Appwrite-Project': projectId }
  if (appwriteKey) headers['X-Appwrite-Key'] = appwriteKey

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, { headers, signal: controller.signal })

    if (!response.ok) {
      const body = await response.text()
      console.warn(`[SEO] Appwrite responded ${response.status}: ${body.slice(0, 200)}`)
      return []
    }

    const data = await response.json()
    const limit = 25
    const all = [...(data.documents || [])]
    const seen = new Set(all.map((post) => post.$id))
    let offset = all.length
    let total = typeof data.total === 'number' ? data.total : offset

    // Paginate so a large blog does not silently lose posts from the sitemap.
    while (offset < total) {
      const page = await fetch(`${url}?limit=${limit}&offset=${offset}`, { headers })
      if (!page.ok) break

      const pageData = await page.json()
      const documents = pageData.documents || []
      if (!documents.length) break

      for (const doc of documents) {
        if (!seen.has(doc.$id)) {
          seen.add(doc.$id)
          all.push(doc)
        }
      }

      offset += documents.length
      total = typeof pageData.total === 'number' ? pageData.total : offset
    }

    const posts = all.filter((post) => post.status === 'active')
    console.log(`[SEO] Fetched ${posts.length} active post(s).`)
    return posts
  } catch (error) {
    console.warn(`[SEO] Could not fetch posts: ${error.message}`)
    return []
  } finally {
    clearTimeout(timeout)
  }
}

function imageUrl(post) {
  if (!post.featuredImage || !bucketId || !projectId) return `${SITE_URL}/og-image.png`
  return `${appwriteUrl}/storage/buckets/${bucketId}/files/${post.featuredImage}/view?project=${projectId}`
}

async function generateSeo() {
  const posts = await fetchPosts()

  if (posts.length === 0) {
    const message =
      '[SEO] No posts were written to sitemap.xml. If you expect posts, check that ' +
      'the Appwrite collection allows public read, or set APPWRITE_API_KEY in .env.'

    if (STRICT) {
      console.error(message)
      process.exitCode = 1
      return
    }
    console.warn(message)
  }

  const publicDir = path.resolve(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

  const today = toDate(new Date())

  // lastmod reflects real edit times; unchanged pages keep their build date.
  const staticRoutes = [
    { loc: '/', lastmod: today },
    { loc: '/all-posts', lastmod: today },
  ]

  const postRoutes = posts.map((post) => ({
    loc: `/post/${post.$id}`,
    lastmod: toDate(post.$updatedAt) || toDate(post.$createdAt) || today,
  }))

  const allRoutes = [...staticRoutes, ...postRoutes]

  // priority and changefreq are ignored by Google and only add noise.
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) =>
      `  <url>\n    <loc>${escapeXml(SITE_URL + route.loc)}</loc>\n    <lastmod>${escapeXml(
        route.lastmod
      )}</lastmod>\n  </url>`
  )
  .join('\n')}
</urlset>
`

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent)

  const sorted = [...posts].sort(
    (a, b) => new Date(b.$createdAt || 0) - new Date(a.$createdAt || 0)
  )

  const rssItems = sorted
    .map((post) => {
      const url = `${SITE_URL}/post/${post.$id}`
      const summary = stripHtml(post.content).slice(0, 250)
      const pubDate = new Date(post.$createdAt || Date.now()).toUTCString()
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description><![CDATA[${escapeCdata(summary)}]]></description>
      <enclosure url="${escapeXml(imageUrl(post))}" type="image/jpeg" />
    </item>`
    })
    .join('\n')

  const rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vaibhav Notes</title>
    <link>${escapeXml(SITE_URL)}</link>
    <atom:link href="${escapeXml(SITE_URL + '/rss.xml')}" rel="self" type="application/rss+xml" />
    <description><![CDATA[${escapeCdata(
      'Practical engineering notes on backend architecture, Linux, DevOps and React.'
    )}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${escapeXml(`${SITE_URL}/og-image.png`)}</url>
      <title>Vaibhav Notes</title>
      <link>${escapeXml(SITE_URL)}</link>
    </image>
${rssItems}
  </channel>
</rss>
`

  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssContent)

  const robotsContent = `User-agent: *
Allow: /
Disallow: /add-post
Disallow: /edit-post/
Disallow: /login
Disallow: /signup

Sitemap: ${SITE_URL}/sitemap.xml
`
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent)

  console.log(
    `[SEO] Wrote sitemap.xml (${allRoutes.length} URLs), rss.xml (${sorted.length} items), robots.txt`
  )
}

generateSeo()
