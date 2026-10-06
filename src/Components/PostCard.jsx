"use client"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, User, ArrowRight, Clock } from "lucide-react"
import appwriteService from "../appwrite/conf"
import { excerpt, readingTime } from "../config/site"
import { postTags, postCategorySlug, slugify, CATEGORY_BY_SLUG } from "../lib/taxonomy"

function PostCard({ $id, title, featuredImage, content, $createdAt, userId, category, tags }) {
  const { data: author, isLoading: authorLoading } = useQuery(
    ["author", userId],
    () => appwriteService.getUserDetails(userId),
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
    },
  )

  const summary = excerpt(content, 220)
  const readMinutes = readingTime(content)
  const categorySlug = postCategorySlug({ category })
  const categoryName = CATEGORY_BY_SLUG[categorySlug]?.name
  const cardTags = postTags({ tags }).slice(0, 3)

  return (
    <motion.div
      whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col w-full h-[480px]"
    >
      <motion.div className="relative h-48 overflow-hidden" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
        <img
          className="w-full h-full object-cover"
          src={featuredImage ? appwriteService.getFileUrl(featuredImage) : "/placeholder.svg"}
          alt={title}
          width="640"
          height="360"
          loading="lazy"
          decoding="async"
        />
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
          whileHover={{ opacity: 1 }}
        >
          <Link
            to={`/post/${$id}`}
            className="px-4 py-2 bg-white text-gray-800 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
          >
            Read More
          </Link>
        </motion.div>
      </motion.div>
      <div className="p-3 sm:p-6 flex flex-col flex-grow">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {categorySlug && (
            <Link
              to={`/categories/${categorySlug}`}
              className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
            >
              {categoryName || categorySlug}
            </Link>
          )}
          {cardTags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${slugify(tag)}`}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          <Link to={`/post/${$id}`}>{title}</Link>
        </h2>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 gap-x-4">
          <div className="flex items-center">
            <User size={16} className="mr-1" />
            <span className="truncate">{authorLoading ? "Loading..." : author ? author.name : "Unknown"}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <span>{new Date($createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{readMinutes} min read</span>
          </div>
        </div>
        <div className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-3 flex-grow">{summary}…</div>
        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }} className="mt-auto">
          <Link
            to={`/post/${$id}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
          >
            Continue Reading
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <ArrowRight size={16} className="ml-1" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PostCard
