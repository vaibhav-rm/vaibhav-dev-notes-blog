"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import parse from "html-react-parser"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Edit2, Trash2, Calendar, User, Clock, Share2, Twitter, Linkedin, Copy, Check, ArrowUp } from "lucide-react"
import appwriteService from "../appwrite/conf"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { SEO } from "../Components"
import { SITE_NAME, SITE_URL, excerpt, postUrl, readingTime } from "../config/site"

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
      <div className="text-xs text-gray-400 bg-gray-900/95 px-4 py-2 border-b border-gray-800 flex justify-between items-center select-none font-mono">
        <span className="font-semibold text-gray-300">{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700/50 transition-all duration-200 focus:outline-none"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="font-medium">Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default function Post() {
  const [post, setPost] = useState(null)
  const [author, setAuthor] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [showShareToast, setShowShareToast] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { slug } = useParams()
  const navigate = useNavigate()

  const userData = useSelector((state) => state.auth.userData)

  const isAuthor = post && userData ? post.userId === userData.$id : false

  // Reading progress bar & back-to-top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100
        setScrollProgress(progress)
      }

      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  // Handle advanced sharing options
  const handleShareClick = async (platform) => {
    const shareUrl = postUrl(slug)
    const shareTitle = post.title

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 3000)
      setShareMenuOpen(false)
      return
    }

    if (platform === "native") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            url: shareUrl,
          })
        } catch (err) {
          console.log("Error sharing:", err)
        }
      }
      setShareMenuOpen(false)
      return
    }

    let url = ""
    if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
    } else if (platform === "linkedin") {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    } else if (platform === "reddit") {
      url = `https://reddit.com/submit?title=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
    setShareMenuOpen(false)
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

  const handleCommentDelete = async (commentId) => {
    try {
      const status = await appwriteService.deleteComment(commentId)
      if (status) {
        setComments(comments.filter((comment) => comment.$id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const options = {
    replace: (domNode) => {
      if (domNode.name === "pre" && domNode.children[0].name === "code") {
        const code = domNode.children[0].children[0].data
        const className = domNode.children[0].attribs.class
        const language = className ? className.replace("language-", "") : "javascript"
        return (
          <CodeBlock code={code} language={language} />
        )
      }
    },
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const calculateReadTime = readingTime

  // Extract headings (H2 & H3) from post content for TOC sidebar
  const headings = post && post.content ? (() => {
    const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi
    const list = []
    let match
    let count = 0
    while ((match = headingRegex.exec(post.content)) !== null) {
      const level = parseInt(match[1])
      const text = match[2].replace(/<[^>]*>/g, "") // strip inner tags if any
      const id = `heading-${count++}`
      list.push({ level, text, id })
    }
    return list
  })() : []

  // Dynamic injector to add ids to h2/h3 elements at render-time
  const injectHeadingIds = (html) => {
    if (!html) return ""
    let count = 0
    return html.replace(/<h([23])([^>]*)>/gi, (match, level, attrs) => {
      if (!attrs.includes("id=")) {
        return `<h${level}${attrs} id="heading-${count++}">`
      }
      return match
    })
  }

  if (!post) {
    return (
      <>
        <SEO title="Loading post" description="Loading article." noindex />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading…</p>
        </div>
      </>
    )
  }

  const canonical = postUrl(slug)
  const description = excerpt(post.content)
  const publishedTime = post.$createdAt || post.createdAt
  const modifiedTime = post.$updatedAt || post.updatedAt || publishedTime
  const authorName = author?.name || "Vaibhav"
  const featuredImage = post.featuredImage
    ? appwriteService.getFileUrl(post.featuredImage)
    : `${SITE_URL}/og-image.png`
  const wordCount = post.content ? post.content.split(/\s+/).filter(Boolean).length : 0

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonical}#blogposting`,
        isPartOf: { "@id": `${SITE_URL}/#blog` },
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        url: canonical,
        headline: post.title,
        name: post.title,
        description,
        image: [featuredImage],
        datePublished: publishedTime,
        dateModified: modifiedTime,
        wordCount,
        timeRequired: `PT${readingTime(post.content)}M`,
        isAccessibleForFree: true,
        inLanguage: "en",
        author: {
          "@type": "Person",
          name: authorName,
          url: `${SITE_URL}/`,
        },
        publisher: {
          "@type": "Person",
          name: authorName,
          url: `${SITE_URL}/`,
        },
      },
      {
        "@type": "Blog",
        "@id": `${SITE_URL}/#blog`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: "en",
        publisher: { "@type": "Person", name: "Vaibhav", url: `${SITE_URL}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "All Posts",
            item: `${SITE_URL}/all-posts`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonical,
          },
        ],
      },
    ],
  }

  return (
    <>
      <SEO
        title={post.title}
        description={description}
        path={`/post/${slug}`}
        image={featuredImage}
        type="article"
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        author={authorName}
        schema={schemaData}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-blue-600 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl"
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ChevronLeft className="mr-2 h-5 w-5" /> Back
        </motion.button>

        <div className={headings.length > 0 ? "lg:grid lg:grid-cols-4 lg:gap-8 items-start" : ""}>
          <div className={headings.length > 0 ? "lg:col-span-3 space-y-6" : "max-w-4xl mx-auto space-y-6"}>
            <motion.article
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-lg sm:rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="relative aspect-video">
                <img
                  src={post.featuredImage ? appwriteService.getFileUrl(post.featuredImage) : "/placeholder.svg"}
                  width="1200"
                  height="630"
                  loading="eager"
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
              <div className="p-4 sm:p-8">
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 sm:mb-6 text-gray-900 dark:text-white">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 gap-y-2 gap-x-4 sm:gap-x-6">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{author ? author.name : "Loading..."}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{formatDate(post.$createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{calculateReadTime(post.content)} min read</span>
                  </div>

                  {/* Upgraded Share Button and Dropdown Menu */}
                  <div className="relative ml-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                      onClick={() => setShareMenuOpen(!shareMenuOpen)}
                    >
                      <Share2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Share
                    </motion.button>
                    <AnimatePresence>
                      {shareMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShareMenuOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20"
                          >
                            {navigator.share && (
                              <button
                                onClick={() => handleShareClick("native")}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                              >
                                <Share2 className="mr-2 h-4 w-4" /> Share via Device
                              </button>
                            )}
                            <button
                              onClick={() => handleShareClick("twitter")}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <Twitter className="mr-2 h-4 w-4 text-sky-500" /> Share on X
                            </button>
                            <button
                              onClick={() => handleShareClick("linkedin")}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <Linkedin className="mr-2 h-4 w-4 text-blue-700" /> Share on LinkedIn
                            </button>
                            <button
                              onClick={() => handleShareClick("reddit")}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <svg className="mr-2 h-4 w-4 text-orange-500 fill-current" viewBox="0 0 24 24">
                                <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.41-4.43 3.86.9c.04.93.81 1.68 1.76 1.68 1.01 0 1.83-.82 1.83-1.83-.01-1.01-.83-1.83-1.84-1.83-.75 0-1.4.46-1.68 1.11l-4.42-1.03c-.19-.04-.38.07-.44.25L10.39 7.2c-2.48.04-4.73.68-6.39 1.69-.56-.73-1.44-1.19-2.44-1.19-1.65 0-3 1.35-3 3 0 1.12.61 2.1 1.53 2.61-.06.29-.09.59-.09.89 0 3.86 4.49 7 10 7s10-3.14 10-7c0-.3-.03-.6-.09-.89.92-.51 1.53-1.49 1.53-2.61zm-19.5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm11 4.5c-1.77 1.77-5.13 1.77-6.9 0-.15-.15-.15-.39 0-.54.15-.15.39-.15.54 0 1.48 1.48 4.34 1.48 5.82 0 .15-.15.39-.15.54 0 .15.15.15.39 0 .54zm-.5-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                              </svg> Share on Reddit
                            </button>
                            <button
                              onClick={() => handleShareClick("copy")}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <Copy className="mr-2 h-4 w-4" /> Copy Link
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none prose-p:my-3 sm:prose-p:my-5 prose-headings:my-3 sm:prose-headings:my-6 prose-img:my-4 sm:prose-img:my-6">
                  {parse(injectHeadingIds(post.content), options)}
                </div>
              </div>
            </motion.article>

            {/* Comment Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg sm:rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
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
                {comments.map((comment) => {
                  const canDelete = userData && (comment.userId === userData.$id || isAuthor)
                  return (
                    <div key={comment.$id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span className="font-semibold text-gray-900 dark:text-white">{comment.userName}</span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        {canDelete && (
                          <button
                            onClick={() => handleCommentDelete(comment.$id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                            title="Delete comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 pl-6">{comment.content}</p>
                    </div>
                  )
                })}
              </div>
            </motion.section>
          </div>

          {/* Table of Contents Sidebar */}
          {headings.length > 0 && (
            <aside className="hidden lg:block lg:col-span-1 sticky top-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                  Table of Contents
                </h3>
                <nav className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        const element = document.getElementById(heading.id)
                        if (element) {
                          const offset = 80 // offset for navbar
                          const elementPosition = element.getBoundingClientRect().top
                          const offsetPosition = elementPosition + window.pageYOffset - offset
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth",
                          })
                        }
                      }}
                      className={`block text-sm transition-colors duration-200 ${
                        heading.level === 3
                          ? "pl-4 text-xs text-gray-500 dark:text-gray-500 hover:text-blue-500"
                          : "font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </motion.div>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 right-6 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl z-50 border border-blue-500/20 backdrop-blur-sm"
            title="Back to top"
          >
            <ArrowUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
