import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { PostCard, PostCardSkeleton, SEO } from '../Components'
import appwriteService from '../appwrite/conf'
import site, { SITE_NAME, SITE_URL } from '../config/site'
import '../App.css'

const POSTS_CACHE_KEY = 'blogPosts'
const POSTS_CACHE_TIME = 1000 * 60 * 5 // 5 minutes

const PAGE_TITLE = 'Latest Posts'
const PAGE_DESCRIPTION =
  'Practical engineering notes on backend architecture, Linux, DevOps and React — written by Vaibhav.'

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: PAGE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#person` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: site.author,
      url: `${SITE_URL}/`,
    },
    {
      '@type': 'Blog',
      '@id': `${SITE_URL}/#blog`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: PAGE_DESCRIPTION,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      author: { '@id': `${SITE_URL}/#person` },
      publisher: { '@id': `${SITE_URL}/#person` },
    },
  ],
}

function Home() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredPosts = useMemo(() => {
    if (!posts) return []
    const query = searchQuery.trim().toLowerCase()
    if (!query) return posts
    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query)
    )
  }, [posts, searchQuery])

  const body = (() => {
    if (isLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-5xl font-bold mb-12 text-gray-800 dark:text-white text-center">
            Latest Posts
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <PostCardSkeleton key={idx} />
            ))}
          </div>
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

        {/* Search Bar */}
        <div className="flex flex-col items-center mb-8 max-w-xl mx-auto px-4 w-full">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search latest notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, index) => (
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
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-500 dark:text-gray-400">
              No posts match your search query.
            </h3>
          </div>
        )}
      </motion.div>
    )
  })()

  return (
    <>
      <SEO
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        path="/"
        type="website"
        schema={homeSchema}
      />
      {body}
    </>
  )
}

export default Home