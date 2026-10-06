/**
 * Category and tag helpers.
 *
 * Both fields are optional on the Appwrite collection, so every reader here is
 * defensive: posts written before the taxonomy existed simply have neither.
 */

export const CATEGORIES = [
  { slug: 'backend', name: 'Backend', description: 'Server architecture, APIs, databases and the trade-offs behind them.' },
  { slug: 'frontend', name: 'Frontend', description: 'Building interfaces that stay fast and accessible.' },
  { slug: 'devops', name: 'DevOps', description: 'CI, deployment pipelines and keeping things running.' },
  { slug: 'linux', name: 'Linux', description: 'Command line, system internals and hardening.' },
  { slug: 'robotics', name: 'Robotics', description: 'ROS, embedded systems and autonomous software.' },
  { slug: 'meta', name: 'Meta', description: 'Notes on the craft and the journey.' },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]))

const TAG_MAX_LENGTH = 32
const TAGS_MAX_COUNT = 8

export const slugify = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

/** Normalises whatever Appwrite hands back into a clean array of tag strings. */
export const normalizeTags = (tags) => {
  const list = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : []
  const seen = new Set()
  const out = []
  for (const raw of list) {
    const tag = String(raw ?? '').trim().replace(/\s+/g, ' ')
    if (!tag) continue
    const key = slugify(tag)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(tag.slice(0, TAG_MAX_LENGTH))
    if (out.length >= TAGS_MAX_COUNT) break
  }
  return out
}

export const normalizeCategory = (category) => {
  const slug = slugify(category)
  return slug || ''
}

/** "Protect Linux" -> { name: "Protect Linux", slug: "protect-linux" } */
export const toTagRef = (tag) => ({
  name: String(tag).trim(),
  slug: slugify(tag),
})

/**
 * Builds the tag -> count index used by the tag cloud and the /tags index.
 * Sorted by count descending, then alphabetically for a stable order.
 */
export const buildTagIndex = (posts = []) => {
  const counts = new Map()
  for (const post of posts) {
    for (const tag of normalizeTags(post.tags)) {
      const { slug, name } = toTagRef(tag)
      const entry = counts.get(slug) || { slug, name, count: 0 }
      entry.count += 1
      counts.set(slug, entry)
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  )
}

export const buildCategoryIndex = (posts = []) => {
  const counts = new Map()
  for (const post of posts) {
    const slug = normalizeCategory(post.category)
    if (!slug) continue
    const meta = CATEGORY_BY_SLUG[slug]
    const entry = counts.get(slug) || {
      slug,
      name: meta?.name || slug,
      description: meta?.description || `Posts filed under ${slug}.`,
      count: 0,
    }
    entry.count += 1
    counts.set(slug, entry)
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  )
}

export const hasCategory = (post) => normalizeCategory(post?.category) !== ''
export const postTags = (post) => normalizeTags(post?.tags)
export const postCategorySlug = (post) => normalizeCategory(post?.category)

/**
 * Picks posts that share the most tags with the given post, newest first.
 * Ties break on recency so the result is deterministic between builds.
 */
export const relatedPosts = (post, allPosts = [], limit = 3) => {
  const targetTags = new Set(postTags(post).map((t) => slugify(t)))
  const targetCategory = postCategorySlug(post)
  const slug = post?.$id

  return allPosts
    .filter((candidate) => candidate?.$id && candidate.$id !== slug)
    .map((candidate) => {
      const shared = postTags(candidate).filter((t) => targetTags.has(slugify(t))).length
      const sameCategory =
        targetCategory && postCategorySlug(candidate) === targetCategory ? 1 : 0
      return { candidate, score: shared * 2 + sameCategory }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (
        new Date(b.candidate.$createdAt || 0) - new Date(a.candidate.$createdAt || 0)
      )
    })
    .slice(0, limit)
    .map((entry) => entry.candidate)
}

export const sortByDateDesc = (posts = []) =>
  [...posts].sort((a, b) => new Date(b.$createdAt || 0) - new Date(a.$createdAt || 0))

export const uniquePosts = (posts = []) => {
  const seen = new Set()
  return posts.filter((post) => {
    const id = post?.$id
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}