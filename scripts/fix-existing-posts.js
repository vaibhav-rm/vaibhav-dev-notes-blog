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

const appwriteUrl = process.env.VITE_APPWRITE_URL
const projectId = process.env.VITE_PROJECT_ID
const databaseId = process.env.VITE_DATABASE_ID
const collectionId = process.env.VITE_COLLECTION_ID
const appwriteKey = process.env.APPWRITE_API_KEY

if (!appwriteUrl || !projectId || !databaseId || !collectionId) {
  console.error('Missing Appwrite env vars in .env')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
}
if (appwriteKey) headers['X-Appwrite-Key'] = appwriteKey

export function cleanHtmlContent(html) {
  if (!html || typeof html !== 'string') return ''

  let cleaned = html

  // Remove redundant style="text-align: left;" or style="text-align: start;" on tags (since left is global default)
  cleaned = cleaned.replace(/style="\s*text-align:\s*(left|start);?\s*"/gi, '')

  // Clean style attributes that became empty style=""
  cleaned = cleaned.replace(/\s*style=""/gi, '')

  // Remove empty spans like <span>text</span> with no attributes
  cleaned = cleaned.replace(/<span>(.*?)<\/span>/gi, '$1')

  return cleaned.trim()
}

async function run() {
  console.log('Fetching posts from Appwrite...')
  const url = `${appwriteUrl}/databases/${databaseId}/collections/${collectionId}/documents`

  try {
    const res = await fetch(`${url}?limit=100`, { headers })
    if (!res.ok) {
      console.error(`Failed to fetch posts (${res.status}): ${await res.text()}`)
      return
    }

    const data = await res.json()
    const posts = data.documents || []
    console.log(`Found ${posts.length} posts. Checking HTML content alignment and character counts...`)

    let updatedCount = 0

    for (const post of posts) {
      const original = post.content || ''
      const cleaned = cleanHtmlContent(original)

      if (cleaned !== original) {
        console.log(`[Post ${post.$id}] Cleaning content (${original.length} chars -> ${cleaned.length} chars)`)
        if (appwriteKey) {
          const patchRes = await fetch(`${url}/${post.$id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ content: cleaned })
          })
          if (patchRes.ok) {
            console.log(`  Successfully updated post ${post.$id} in Appwrite.`)
            updatedCount++
          } else {
            console.warn(`  Failed to update post ${post.$id}: ${await patchRes.text()}`)
          }
        } else {
          console.log(`  [Dry Run] APPWRITE_API_KEY not set in .env. Skip server patch.`)
        }
      } else {
        console.log(`[Post ${post.$id}] HTML content clean (${original.length} chars). No changes needed.`)
      }
    }

    console.log(`Finished processing ${posts.length} posts. ${updatedCount} post(s) updated in database.`)
  } catch (err) {
    console.error('Error during post migration:', err.message)
  }
}

run()
