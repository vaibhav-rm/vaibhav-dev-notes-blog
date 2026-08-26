import fs from 'fs';
import path from 'path';

// Helper to manually parse a local .env file if it exists (for local development builds)
const loadEnv = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (parts) {
          const key = parts[1];
          let val = parts[2] || '';
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val;
        }
      });
      console.log('[SEO Generator] Loaded local .env configuration');
    }
  } catch (err) {
    console.warn('[SEO Generator] Warning loading .env:', err.message);
  }
};

loadEnv();

const appwriteUrl = process.env.VITE_APPWRITE_URL;
const projectId = process.env.VITE_PROJECT_ID;
const databaseId = process.env.VITE_DATABASE_ID;
const collectionId = process.env.VITE_COLLECTION_ID;

const SITE_URL = 'https://vaibhavnotes.pages.dev';

async function generateSeo() {
  let posts = [];
  let fetchSuccess = false;

  try {
    if (appwriteUrl && projectId && databaseId && collectionId) {
      console.log('[SEO Generator] Fetching active posts from Appwrite...');
      
      // Construct Appwrite documents endpoint URL
      const fetchUrl = `${appwriteUrl}/databases/${databaseId}/collections/${collectionId}/documents`;
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': projectId,
        }
      });

      if (response.ok) {
        const data = await response.json();
        posts = (data.documents || []).filter(post => post.status === 'active');
        console.log(`[SEO Generator] Found ${posts.length} active posts.`);
        fetchSuccess = true;
      } else {
        console.warn(`[SEO Generator] Appwrite API responded with status ${response.status}. Falling back to static routes.`);
      }
    } else {
      console.log('[SEO Generator] Appwrite environment variables are missing. Generating static routes only.');
    }
  } catch (error) {
    console.error('[SEO Generator] Error fetching database posts:', error.message);
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Ensure public folder exists
    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 1. Generate Sitemap XML
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/all-posts</loc>
    <priority>0.8</priority>
    <changefreq>daily</changefreq>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/login</loc>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/signup</loc>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${today}</lastmod>
  </url>
  ${posts.map(post => {
    const lastMod = post.$updatedAt ? post.$updatedAt.split('T')[0] : (post.$createdAt ? post.$createdAt.split('T')[0] : today);
    return `  <url>
    <loc>${SITE_URL}/post/${post.$id}</loc>
    <priority>0.6</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${lastMod}</lastmod>
  </url>`;
  }).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
    console.log('[SEO Generator] Successfully generated public/sitemap.xml');

    // 2. Generate RSS Feed XML
    const escapeXml = (unsafe) => {
      if (!unsafe) return '';
      return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    const rssItems = posts.map(post => {
      const postUrl = `${SITE_URL}/post/${post.$id}`;
      const cleanTitle = escapeXml(post.title);
      // Strip HTML tags for description
      const strippedContent = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
      const cleanDesc = escapeXml(strippedContent.substring(0, 250) + (strippedContent.length > 250 ? '...' : ''));
      const pubDate = new Date(post.$createdAt || post.createdAt || new Date()).toUTCString();
      
      return `    <item>
      <title>${cleanTitle}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${cleanDesc}</description>
    </item>`;
    }).join('\n');

    const rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vaibhav Notes</title>
    <link>${SITE_URL}</link>
    <description>Explore insightful articles on technology, programming, and more at Vaibhav Notes.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

    fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssContent);
    console.log('[SEO Generator] Successfully generated public/rss.xml');

  } catch (error) {
    console.error('[SEO Generator] Error generating SEO XML files:', error.message);
  }
}

generateSeo();
