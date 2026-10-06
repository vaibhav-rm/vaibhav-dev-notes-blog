import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SEO } from '../Components'

function NotFound() {
  return (
    <>
      <SEO
        title="Page not found"
        description="The page you were looking for does not exist."
        path="/404"
        noindex
      />
      <div className="container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            This page does not exist
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The link may be broken, or the post may have been moved or deleted.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Back to home
            </Link>
            <Link
              to="/all-posts"
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Browse all posts
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default NotFound
