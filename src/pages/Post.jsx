import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import parse from 'html-react-parser'
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react'
import appwriteService from '../appwrite/conf'

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
          // Fetch author data
          appwriteService.getUser(fetchedPost.userId).then((user) => {
            setAuthor(user)
          }).catch(error => {
            console.error("Error fetching author data:", error)
            setAuthor({ name: "Unknown Author" })
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

  if (!post) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-gray-600 dark:text-gray-200 dark:hover:text-gray-50 hover:text-gray-900 transition-colors duration-200"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </button>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </Link>
              <button
                onClick={deletePost}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-black tracking-tight mb-4">{post.title}</h1>
          <div className="prose max-w-none">{parse(post.content)}</div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-700">
                  {author ? author.name.charAt(0) : '?'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {author ? author.name : 'Loading...'}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(post.$createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}