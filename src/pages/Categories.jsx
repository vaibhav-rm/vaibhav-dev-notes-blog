import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../Components/SEO'
import { useAllPosts } from '../lib/useAllPosts'
import { buildCategoryIndex, CATEGORIES } from '../lib/taxonomy'
import { SITE_URL } from '../config/site'

export default function Categories() {
  const { posts, isLoading } = useAllPosts()
  const categories = useMemo(() => buildCategoryIndex(posts), [posts])

  // Categories with no posts yet are listed as empty so the taxonomy is visible
  // and the URLs are crawlable once the first post lands in them.
  const rows = [
    ...categories,
    ...CATEGORIES.filter(
      (category) => !categories.some((entry) => entry.slug === category.slug)
    ).map((category) => ({ ...category, count: 0 })),
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Categories',
    description: 'Every topic covered on Vaibhav Notes, from backend architecture to Linux hardening.',
    url: `${SITE_URL}/categories`,
    isPartOf: { '@id': `${SITE_URL}/#blog` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categories.length,
      itemListElement: categories.map((category, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/categories/${category.slug}`,
        name: category.name,
      })),
    },
  }

  return (
    <>
      <SEO
        title="Categories"
        description="Every topic covered on Vaibhav Notes, from backend architecture to Linux hardening."
        path="/categories"
        schema={categories.length ? schema : undefined}
      />

      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isLoading
              ? 'Loading categories…'
              : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} in use.`}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((category) => (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {category.name}
              </h2>
              <p className="mt-2 flex-grow text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
              <span className="mt-4 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {category.count} article{category.count === 1 ? '' : 's'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}