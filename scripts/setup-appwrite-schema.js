/**
 * One-time migration: adds the optional `category` and `tags` attributes to the
 * Appwrite posts collection, and optionally backfills them for existing posts.
 *
 * Usage:
 *   npm run setup:schema            # add attributes only
 *   npm run setup:schema -- --seed  # also backfill existing posts
 *
 * Requires APPWRITE_API_KEY in .env. Never commit that key.
 */

import fs from 'fs'
import path from 'path'

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

const endpoint = process.env.VITE_APPWRITE_URL
const projectId = process.env.VITE_PROJECT_ID
const databaseId = process.env.VITE_DATABASE_ID
const collectionId = process.env.VITE_COLLECTION_ID
const apiKey = process.env.APPWRITE_API_KEY
const shouldSeed = process.argv.includes('--seed')

const headers = () => ({
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
})

const call = async (method, url, body) => {
  const response = await fetch(`${endpoint}${url}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let parsed = {}
  try {
    parsed = text ? JSON.parse(text) : {}
  } catch {
    parsed = { message: text }
  }

  if (!response.ok) {
    const error = new Error(parsed.message || `${method} ${url} failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return parsed
}

/**
 * Backfill suggestions for posts written before the taxonomy existed. Keep the
 * list small and topical — a handful of accurate tags beats a wide net.
 */
const SEED = {
  'first-blog-post-': { category: 'meta', tags: ['introduction', 'blogging'] },
  'how-i-structure-my-backend-projects': {
    category: 'backend',
    tags: ['architecture', 'project-structure', 'nodejs'],
  },
  'understanding-github-workflows': {
    category: 'devops',
    tags: ['github-actions', 'ci-cd', 'automation'],
  },
  'new-beginnings-at-rvce': { category: 'meta', tags: ['college', 'personal'] },
  'react-native-installation-for-linux': {
    category: 'frontend',
    tags: ['react-native', 'linux', 'setup'],
  },
  'protect-linux-system-from-hackers': {
    category: 'linux',
    tags: ['security', 'firewall', 'hardening'],
  },
  'a-retro-terminal-spotify-experience': {
    category: 'frontend',
    tags: ['spotify', 'terminal', 'project'],
  },
  'frontend-without-backend': {
    category: 'frontend',
    tags: ['backend', 'static-site', 'architecture'],
  },
  'what-is-ros-and-how-to-install-it-': {
    category: 'robotics',
    tags: ['ros', 'ubuntu', 'installation'],
  },
}

async function ensureAttribute(attribute) {
  try {
    await call('POST', `/databases/${databaseId}/collections/${collectionId}/attributes`, attribute)
    console.log(`  created attribute "${attribute.key}"`)
    return true
  } catch (error) {
    if (error.status === 409) {
      console.log(`  attribute "${attribute.key}" already exists`)
      return false
    }
    throw error
  }
}

async function listAttributes() {
  const attributes = []
  let offset = 0
  const limit = 100

  for (;;) {
    const page = await call(
      'GET',
      `/databases/${databaseId}/collections/${collectionId}/attributes?limit=${limit}&offset=${offset}`
    )
    attributes.push(...(page.attributes || []))
    offset += limit
    if (offset >= (page.total ?? attributes.length)) break
  }
  return attributes
}

async function seedPosts() {
  const documents = []
  let offset = 0
  const limit = 25

  for (;;) {
    const page = await call(
      'GET',
      `/databases/${databaseId}/collections/${collectionId}/documents?limit=${limit}&offset=${offset}`
    )
    documents.push(...(page.documents || []))
    offset += limit
    if (offset >= (page.total ?? documents.length)) break
  }

  let updated = 0
  for (const document of documents) {
    const suggestion = SEED[document.$id]
    if (!suggestion) continue
    if (document.category && document.tags?.length) {
      console.log(`  skip "${document.$id}" (already classified)`)
      continue
    }
    await call(
      'PATCH',
      `/databases/${databaseId}/collections/${collectionId}/documents/${document.$id}`,
      {
        category: suggestion.category,
        tags: suggestion.tags,
      }
    )
    updated += 1
    console.log(`  classified "${document.$id}" -> ${suggestion.category}`)
  }
  console.log(`  backfilled ${updated} post(s)`)
}

async function main() {
  if (!endpoint || !projectId || !databaseId || !collectionId) {
    console.error('Missing Appwrite env vars. Check VITE_APPWRITE_URL, VITE_PROJECT_ID, VITE_DATABASE_ID, VITE_COLLECTION_ID.')
    process.exitCode = 1
    return
  }
  if (!apiKey) {
    console.error(
      'Missing APPWRITE_API_KEY.\n' +
        'Create a key in Appwrite Console → Integrations → API Keys with database read/write scope,\n' +
        'add it to .env as APPWRITE_API_KEY=..., then re-run.'
    )
    process.exitCode = 1
    return
  }

  console.log('Inspecting posts collection...')
  const before = await listAttributes()
  const existing = new Set(before.map((a) => a.key))

  if (existing.has('category') && existing.has('tags')) {
    console.log('  category and tags attributes already present, nothing to migrate')
  } else {
    console.log('Adding missing attributes:')
    if (!existing.has('category')) {
      await ensureAttribute({
        key: 'category',
        type: 'string',
        size: 64,
        required: false,
        array: false,
        default: '',
      })
    }
    if (!existing.has('tags')) {
      await ensureAttribute({
        key: 'tags',
        type: 'string',
        size: 32,
        required: false,
        array: true,
        elements: [],
      })
    }
    console.log('Done. Appwrite builds attributes asynchronously; give it ~10 seconds.')
  }

  if (shouldSeed) {
    console.log('Backfilling existing posts...')
    await seedPosts()
  }

  console.log('Run `npm run build` to regenerate sitemap.xml and rss.xml.')
}

main().catch((error) => {
  console.error('Schema setup failed:', error.message)
  process.exitCode = 1
})