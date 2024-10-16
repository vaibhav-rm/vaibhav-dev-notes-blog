import React, { useEffect, useState } from 'react'
import PostCard from '../Components/PostCard'
import appwriteService from '../appwrite/conf'
import '../App.css'

function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appwriteService.getPosts([])
      .then((post) => {
        if (post && post.documents) {
          const sortedPosts = post.documents.sort((a, b) => {
            return new Date(b.$createdAt) - new Date(a.$createdAt)
          })
          setPosts(sortedPosts)
        }
      })
      .catch((error) => {
        console.error('Error fetching posts:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-300">No posts available.</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Latest Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.$id} {...post} />
        ))}
      </div>
    </div>
  )
}

export default Home