import { PostCard, PostCardSkeleton } from './index'

export default function PostGrid({ posts, loading, emptyMessage, columns = 'lg:grid-cols-3' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!posts.length) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${columns}`}>
      {posts.map((post) => (
        <PostCard key={post.$id} {...post} />
      ))}
    </div>
  )
}