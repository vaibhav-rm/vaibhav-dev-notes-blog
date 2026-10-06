import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { buildCategoryIndex, buildTagIndex } from '../lib/taxonomy'

/**
 * Browse by category and tag. Rendered as real links so crawlers can follow
 * them; the click is enhanced with client-side filtering where it makes sense.
 */
export default function TaxonomyFilter({
  posts = [],
  activeCategory = '',
  activeTag = '',
  onSelectCategory,
  onSelectTag,
  showTags = true,
}) {
  const categories = useMemo(() => buildCategoryIndex(posts), [posts])
  const tags = useMemo(() => buildTagIndex(posts).slice(0, 18), [posts])

  if (!categories.length && !tags.length) return null

  const chipBase =
    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap'
  const chipIdle =
    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
  const chipActive = 'bg-blue-600 text-white hover:bg-blue-700'
  const chipLink =
    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white transition-colors'

  return (
    <div className="mb-8 space-y-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Category
          </span>
          {onSelectCategory && (
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              className={`${chipBase} ${activeCategory ? chipIdle : chipActive}`}
            >
              All
            </button>
          )}
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              onClick={() => onSelectCategory?.(category.slug)}
              className={`${chipBase} ${
                onSelectCategory && activeCategory === category.slug ? chipActive : chipLink
              }`}
            >
              {category.name}
              <span className="ml-1.5 opacity-70">{category.count}</span>
            </Link>
          ))}
        </div>
      )}

      {showTags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tags
          </span>
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              to={`/tags/${tag.slug}`}
              onClick={() => onSelectTag?.(tag.slug)}
              className={`${chipBase} ${
                onSelectTag && activeTag === tag.slug
                  ? chipActive
                  : `${chipLink} text-xs`
              }`}
            >
              #{tag.name}
              <span className="ml-1.5 opacity-70">{tag.count}</span>
            </Link>
          ))}
          <Link
            to="/tags"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            All tags →
          </Link>
        </div>
      )}
    </div>
  )
}