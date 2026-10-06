import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../Components/SEO'
import { useAllPosts } from '../lib/useAllPosts'
import { buildTagIndex } from '../lib/taxonomy'
import { SITE_URL } from '../config/site'

export default function Tags() {
  const { posts, isLoading } = useAllPosts()
  const tags = useMemo(() => buildTagIndex(posts), [posts])

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tags',
    description: 'Every tag used across the articles on Vaibhav Notes.',
    url: `${SITE_URL}/tags`,
    isPartOf: { '@id': `${SITE_URL}/#blog` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tags.length,
      itemListElement: tags.map((tag, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/tags/${tag.slug}`,
        name: tag.name,
      })),
    },
  }

  return (
    <>
      <SEO
        title="Tags"
        description="Browse every article on Vaibhav Notes by tag — backend, Linux, DevOps, security and more."
        path="/tags"
        schema={tags.length ? schema : undefined}
      />

      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Tags
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isLoading
              ? 'Loading tags…'
              : `${tags.length} tag${tags.length === 1 ? '' : 's'} across ${posts.length} article${
                  posts.length === 1 ? '' : 's'
                }.`}
          </p>
        </header>

        {!isLoading && tags.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No tags yet. Add tags to a post and they will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                to={`/tags/${tag.slug}`}
                className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
              >
                #{tag.name}
                <span className="ml-2 rounded-full bg-white/70 dark:bg-black/20 px-2 py-0.5 text-xs font-medium">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}