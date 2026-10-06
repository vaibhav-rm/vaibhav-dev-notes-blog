import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import SEO from '../Components/SEO'
import PostGrid from '../Components/PostGrid'
import NotFound from './NotFound'
import { useAllPosts } from '../lib/useAllPosts'
import { buildTagIndex, slugify, postTags } from '../lib/taxonomy'
import { SITE_URL } from '../config/site'

export default function Tag() {
  const { slug: rawSlug } = useParams()
  const slug = slugify(rawSlug)
  const { posts, isLoading } = useAllPosts()

  const tagIndex = useMemo(() => buildTagIndex(posts), [posts])

  const tagged = useMemo(() => {
    if (!slug) return []
    return posts.filter((post) =>
      postTags(post).some((tag) => slugify(tag) === slug)
    )
  }, [posts, slug])

  const current = tagIndex.find((tag) => tag.slug === slug)

  if (!isLoading && !current) {
    return <NotFound />
  }

  const title = current ? `Posts tagged "${current.name}"` : 'Tag'
  const description = current
    ? `${current.count} article${current.count === 1 ? '' : 's'} tagged "${current.name}" on Vaibhav Notes — engineering notes on backend, Linux, DevOps and React.`
    : 'Posts with this tag on Vaibhav Notes.'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${SITE_URL}/tags/${slug}`,
    isPartOf: { '@id': `${SITE_URL}/#blog` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tagged.length,
      itemListElement: tagged.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/post/${post.$id}`,
        name: post.title,
      })),
    },
  }

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={`/tags/${slug}`}
        schema={schema}
      />

      <div className="container mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link to="/tags" className="hover:text-blue-600 dark:hover:text-blue-400">
                Tags
              </Link>
            </li>
            {current && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li className="font-medium text-gray-800 dark:text-gray-200" aria-current="page">
                  {current.name}
                </li>
              </>
            )}
          </ol>
        </nav>

        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Tag
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            #{current?.name || slug}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {current
              ? `${current.count} article${current.count === 1 ? '' : 's'}`
              : 'Loading articles…'}
          </p>
        </header>

        <PostGrid
          posts={tagged}
          loading={isLoading}
          emptyMessage="No articles carry this tag yet."
        />

        {tagIndex.length > 0 && (
          <section className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Browse other tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {tagIndex
                .filter((tag) => tag.slug !== slug)
                .slice(0, 24)
                .map((tag) => (
                  <Link
                    key={tag.slug}
                    to={`/tags/${tag.slug}`}
                    className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    #{tag.name}
                    <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {tag.count}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}