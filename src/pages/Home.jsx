import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
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
    posts?.forEach(post => {
      queryClient.prefetchQuery(['author', post.userId], () => appwriteService.getUserDetails(post.userId))
    })
  }, [posts, queryClient])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-center text-red-600"
        >
          Error loading posts. Please try again later.
        </motion.h1>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-center text-gray-700 dark:text-gray-300"
        >
          No posts available.
        </motion.h1>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.h1
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-5xl font-bold mb-12 text-gray-800 dark:text-white text-center"
      >
        Latest Posts
      </motion.h1>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.$id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="w-full"
          >
            <PostCard {...post} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Home