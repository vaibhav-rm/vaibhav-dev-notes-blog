"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import parse from "html-react-parser"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Edit2, Trash2, Calendar, User, Clock, Share2 } from "lucide-react"
import appwriteService from "../appwrite/conf"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Helmet } from "react-helmet"

export default function Post() {
  const [post, setPost] = useState(null)
  const [author, setAuthor] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [showShareToast, setShowShareToast] = useState(false)
  const { slug } = useParams()
  const navigate = useNavigate()

  const userData = useSelector((state) => state.auth.userData)

  const isAuthor = post && userData ? post.userId === userData.$id : false

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((fetchedPost) => {
        if (fetchedPost) {
          setPost(fetchedPost)
          appwriteService
            .getUserDetails(fetchedPost.userId)
            .then((user) => {
              setAuthor(user)
            })
            .catch((error) => {
              console.error("Error fetching author data:", error)
            })
          // Fetch comments
          appwriteService
            .getComments(fetchedPost.$id)
            .then((fetchedComments) => {
              if (fetchedComments && fetchedComments.documents) {
                setComments(fetchedComments.documents)
              } else {
                setComments([]) // fallback if empty
              }
            })
            .catch((error) => {
              console.error("Error fetching comments:", error)
              setComments([])
            })
        } else {
          navigate("/")
        }
      })
    } else {
      navigate("/")
    }
  }, [slug, navigate])

  const deletePost = () => {
    appwriteService.deletePost(post.$id).then((status) => {
      if (status) {
        appwriteService.deleteFile(post.featuredImage)
        navigate("/")
      }
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (newComment.trim() && userData) {
      const commentData = {
        postId: post.$id,
        userId: userData.$id,
        userName: userData.name || "Anonymous", // optional, in case you want to display name
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      }

      try {
        const addedComment = await appwriteService.addComment(commentData)

        if (addedComment) {
          // Appwrite returns the full created document
          setComments([addedComment, ...comments])
          setNewComment("")
        }
      } catch (error) {
        console.error("Error adding comment:", error)
      }
    }
  }

  const options = {
    replace: (domNode) => {
      if (domNode.name === "pre" && domNode.children[0].name === "code") {
        const code = domNode.children[0].children[0].data
        const className = domNode.children[0].attribs.class
        const language = className ? className.replace("language-", "") : "javascript"
        return (
          <SyntaxHighlighter language={language} style={tomorrow}>
            {code}
          </SyntaxHighlighter>
        )
      }
    },
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
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
    <>
      <Helmet>
        <title>{post.title} | Your Blog Name</title>
        <meta name="description" content={post.content.substring(0, 160)} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content.substring(0, 160)} />
        <meta property="og:image" content={appwriteService.getFilePreview(post.featuredImage)} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-1 sm:px-4 py-2 sm:py-8 max-w-4xl"
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ChevronLeft className="mr-2 h-5 w-5" /> Back
        </motion.button>
        <motion.article
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-lg sm:rounded-2xl overflow-hidden"
        >
          <div className="relative aspect-video">
            <img
              src={appwriteService.getFileUrl(post.featuredImage) || "/placeholder.svg"}
              alt={post.title}
              className="object-cover w-full h-full"
            />
            {isAuthor && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 space-x-2">
                <Link
                  to={`/edit-post/${post.$id}`}
                  className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Edit2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Edit
                </Link>
                <button
                  onClick={deletePost}
                  className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Delete
                </button>
              </div>
            )}
          </div>
          <div className="p-4 sm:p-4">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 sm:mb-6 text-gray-900 dark:text-white">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center mb-2 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center w-full sm:w-auto">
                <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span>{author ? author.name : "Loading..."}</span>
              </div>
              <div className="flex items-center w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span>{formatDate(post.$createdAt)}</span>
              </div>
              <div className="flex items-center w-full sm:w-auto">
                <Clock className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span>{calculateReadTime(post.content)} min read</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Share
              </motion.button>
            </div>
            <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none prose-p:my-3 sm:prose-p:my-5 prose-headings:my-3 sm:prose-headings:my-6 prose-img:my-4 sm:prose-img:my-6">
              {parse(post.content, options)}
            </div>
          </div>
        </motion.article>

        {/* Comment Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 sm:mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 sm:p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Comments</h2>
          {userData ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
              ></textarea>
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <p className="mb-4 text-gray-600 dark:text-gray-400">Please log in to comment.</p>
          )}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.$id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center mb-2">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-semibold text-gray-900 dark:text-white">{comment.userName}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
