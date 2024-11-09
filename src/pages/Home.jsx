import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import PostCard from '../Components/PostCard'
import appwriteService from '../appwrite/conf'
import '../App.css'

const POSTS_CACHE_KEY = 'blogPosts'
const POSTS_CACHE_TIME = 1000 * 60 * 5 // 5 minutes

function Home() {
  const queryClient = useQueryClient()

  const { data: posts, isLoading, error } = useQuery(
    POSTS_CACHE_KEY,
    async () => {
      const cachedPosts = localStorage.getItem(POSTS_CACHE_KEY)
      if (cachedPosts) {
        return JSON.parse(cachedPosts)
      }
      const fetchedPosts = await appwriteService.getPosts([])
      if (fetchedPosts && fetchedPosts.documents) {
        const sortedPosts = fetchedPosts.documents.sort((a, b) => {
          return new Date(b.$createdAt) - new Date(a.$createdAt)
        })
        localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(sortedPosts))
        return sortedPosts
      }
      return []
    },
    {
      staleTime: POSTS_CACHE_TIME,
      cacheTime: POSTS_CACHE_TIME,
    }
  )

  useEffect(() => {
    // Prefetch author data for each post
    posts?.forEach(post => {
      queryClient.prefetchQuery(['author', post.userId], () => appwriteService.getUserDetails(post.userId))
    })
  }, [posts, queryClient])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center text-red-600">Error loading posts. Please try again later.</h1>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
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