import { useState, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { slugify } from '../lib/taxonomy'

const MAX_TAGS = 8
const MAX_LENGTH = 32

/**
 * Chip-style tag editor. Tags are stored as an array of strings on the document
 * and consumed by /tags/:slug pages, so the value is a plain array.
 */
export default function TagInput({ value = [], onChange, label = 'Tags', id = 'tags' }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const tags = Array.isArray(value) ? value : []

  const commit = (raw) => {
    const tag = String(raw ?? '').trim().replace(/\s+/g, ' ')
    if (!tag) return
    if (tags.length >= MAX_TAGS) return

    const key = slugify(tag)
    if (!key) return
    // Compare on slug so "Linux" and "linux" are treated as the same tag.
    if (tags.some((existing) => slugify(existing) === key)) {
      setDraft('')
      return
    }

    onChange?.([...tags, tag.slice(0, MAX_LENGTH)])
    setDraft('')
  }

  const remove = (index) => onChange?.(tags.filter((_, i) => i !== index))

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      // Otherwise Enter would submit the whole post form mid-typing.
      event.preventDefault()
      commit(draft)
      return
    }
    if (event.key === 'Backspace' && !draft && tags.length) {
      remove(tags.length - 1)
    }
  }

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
          {tags.length}/{MAX_TAGS} · Enter to add
        </span>
      </label>

      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2 cursor-text focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      >
        {tags.map((tag, index) => (
          <span
            key={`${slugify(tag)}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-medium text-blue-800 dark:text-blue-200"
          >
            {tag}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                remove(index)
              }}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800/60"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          id={id}
          ref={inputRef}
          type="text"
          value={draft}
          disabled={tags.length >= MAX_TAGS}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={tags.length >= MAX_TAGS ? 'Tag limit reached' : 'Type a tag, press Enter'}
          className="flex-1 min-w-[8rem] bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 py-0.5"
        />

        {draft && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              commit(draft)
            }}
            className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Plus className="mr-0.5 h-3 w-3" />
            Add
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Tags each get a page at <code className="text-blue-600 dark:text-blue-400">/tags/&lt;tag&gt;</code>
      </p>
    </div>
  )
}