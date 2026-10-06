import { CATEGORIES } from '../lib/taxonomy'

/**
 * Category picker. Offers the fixed editorial taxonomy, and lets an unknown
 * value survive on posts written before the list existed.
 */
export default function CategorySelect({ value = '', onChange, label = 'Category' }) {
  const known = CATEGORIES.some((c) => c.slug === value)
  const showLegacy = value && !known

  return (
    <div className="mb-4">
      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <select
        id="category"
        value={value || ''}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Uncategorised</option>
        {showLegacy && <option value={value}>{value} (existing)</option>}
        {CATEGORIES.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Every category gets a page at <code className="text-blue-600 dark:text-blue-400">/categories/&lt;name&gt;</code>
      </p>
    </div>
  )
}