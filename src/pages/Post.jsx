import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import parse from 'html-react-parser'
import { motion } from 'framer-motion'
import { ChevronLeft, Edit2, Trash2, Calendar, User, Clock, Share2 } from 'lucide-react'
import appwriteService from '../appwrite/conf'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function Post() {
  const [post, setPost] = useState(null)
  const [author, setAuthor] = useState(null)
  const { slug } = useParams()
  const navigate = useNavigate()

  const userData = useSelector((state) => state.auth.userData)

  const isAuthor = post && userData ? post.userId === userData.$id : false

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((fetchedPost) => {
        if (fetchedPost) {
          setPost(fetchedPost)
          appwriteService.getUserDetails(fetchedPost.userId).then((user) => {
            setAuthor(user)
          }).catch(error => {
            console.error("Error fetching author data:", error)
          })
        } else {
          navigate('/')
        }
      })
    } else {
      navigate('/')
    }
  }, [slug, navigate])

  const deletePost = () => {
    appwriteService.deletePost(post.$id).then((status) => {
      if (status) {
        appwriteService.deleteFile(post.featuredImage)
        navigate('/')
      }
    })
  }

  const options = {
    replace: (domNode) => {
      if (domNode.name === 'code' && domNode.attribs && domNode.attribs.class) {
        const language = domNode.attribs.class.replace('language-', '')
        return (
          <SyntaxHighlighter language={language} style={tomorrow}>
            {domNode.children[0].data}
          </SyntaxHighlighter>
        )
      }
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return readTime
  }

  if (!post) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ChevronLeft className="mr-2 h-5 w-5" /> Back
      </motion.button>
      <motion.article
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="relative aspect-video">
          <img
            src={appwriteService.getFilePreview(post.featuredImage)}
            alt={post.title}
            className="object-cover w-full h-full"
          />
          {isAuthor && (
            <div className="absolute top-4 right-4 space-x-2">
              <Link
                to={`/edit-post/${post.$id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </Link>
              <button
                onClick={deletePost}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
        <div className="p-8">
          <h1 className="text-4xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">{post.title}</h1>
          <div className="flex flex-wrap items-center mb-6 text-gray-600 dark:text-gray-400 space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              <span>{author ? author.name : 'Loading...'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              <span>{formatDate(post.$createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              <span>{calculateReadTime(post.content)} min read</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                // You might want to add a toast notification here
              }}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </motion.button>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {parse(post.content, options)}
          </div>
        </div>
      </motion.article>
    </motion.div>
  )
}