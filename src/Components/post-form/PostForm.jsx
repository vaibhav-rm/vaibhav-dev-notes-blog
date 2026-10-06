import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Select, RTE } from '../index'
import appwriteService from '../../appwrite/conf'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from '../LoadingSpinner'
import { AlertCircle, AlertTriangle } from 'lucide-react'

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
    defaultValues: {
      title: post?.title || '',
      slug: post?.$id || "",
      content: post?.content || '',
      status: post?.status || 'active',
    }
  })

  const navigate = useNavigate()
  const userData = useSelector(state => state.auth.userData)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const watchContent = watch('content') || ''
  const contentLength = watchContent.length
  const hasBase64Image = watchContent.includes('data:image/')

  const submit = async (data) => {
    setErrorMsg('')
    const currentContent = data.content || ''
    if (!currentContent.trim()) {
      setErrorMsg('Post content cannot be empty.')
      return
    }
    if (currentContent.length > 10000) {
      setErrorMsg(
        `Content length is ${currentContent.length.toLocaleString()} characters (including HTML markup), which exceeds Appwrite's maximum limit of 10,000 characters. Please shorten your content or remove heavy formatting.`
      )
      return
    }

    setLoading(true)
    let newFile = null
    try {
      if (post) {
        if (data.image && data.image[0]) {
          newFile = await appwriteService.uploadFile(data.image[0])
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: newFile ? newFile.$id : post.featuredImage,
        })

        if (newFile && post.featuredImage) {
          appwriteService.deleteFile(post.featuredImage)
        }

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`)
        }
      } else {
        newFile = await appwriteService.uploadFile(data.image[0])
        if (newFile) {
          data.featuredImage = newFile.$id
          const dbPost = await appwriteService.createPost({
            ...data,
            userId: userData.$id
          })
          if (dbPost) {
            navigate(`/post/${dbPost.$id}`)
          }
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error)
      if (newFile && newFile.$id && !post) {
        await appwriteService.deleteFile(newFile.$id).catch(() => {})
      }
      const errStr = error?.message || String(error)
      if (errStr.includes('10000 chars') || errStr.includes('Attribute "content"')) {
        setErrorMsg(
          `Appwrite Rejected Post: Content is ${currentContent.length.toLocaleString()} characters long (including HTML markup), exceeding the 10,000 character limit. Please reduce post length or text formatting.`
        )
      } else {
        setErrorMsg(errStr || 'An error occurred while saving the post.')
      }
    } finally {
      setLoading(false)
    }
  }

  const slugTransform = useCallback((value) => {
    if (value && typeof value === 'string') {
      return value.trim().toLowerCase().replace(/[^a-zA-Z\d\s]+/g, '-').replace(/\s/g, '-')
    }

    return ''
  }, [])

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'title') {
        setValue('slug', slugTransform(value.title, { shouldValidate: true }))
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, slugTransform, setValue])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="w-full">
      {errorMsg && (
        <div className="w-full mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200 flex justify-between items-start shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-red-800 dark:text-red-300">Post Submission Failed</h4>
              <p className="text-sm mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 text-lg leading-none ml-4"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(submit)} className="flex flex-wrap mt-6">
        <div className="w-full lg:w-2/3 px-2">
          <Input
            label="Title :"
            placeholder="Title"
            className="mb-4"
            {...register("title", { required: true })}
          />
          <Input
            label="Slug :"
            placeholder="Slug"
            className="mb-4"
            {...register("slug", { required: true })}
            onInput={(e) => {
              setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true })
            }}
            disabled={!!post}
          />
          <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />

          {/* HTML Content Character Limit Counter & Warnings */}
          <div className="mt-3 mb-6 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700 text-xs transition-colors duration-200">
            <div className="flex items-center justify-between font-mono">
              <span className="text-gray-600 dark:text-gray-400 font-sans font-medium">
                HTML Character Count (Appwrite Limit):
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  contentLength > 10000
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : contentLength > 8000
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                }`}
              >
                {contentLength.toLocaleString()} / 10,000 chars
              </span>
            </div>

            {contentLength > 10000 && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400 font-semibold space-x-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Exceeds Appwrite 10,000 HTML character limit! Shorten content before submitting.</span>
              </div>
            )}

            {hasBase64Image && (
              <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Embedded Image Detected!</strong> Inline pasted images create huge base64 strings (&gt;50,000 chars) inside HTML content, exceeding Appwrite limits. Please upload your post image using the <em>Featured Image</em> field instead of pasting inside the editor.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/3 px-2 mt-6 lg:mt-0">
          <Input
            label="Featured Image :"
            type="file"
            className="mb-4"
            accept="image/png, image/jpg, image/jpeg, image/gif"
            {...register("image", { required: !post })}
          />
          {post && (
            <div className="w-full mb-4">
              <img
                src={appwriteService.getFileUrl(post.featuredImage)}
                alt={post.title}
                className="rounded-lg object-cover max-h-48 w-full"
              />
            </div>
          )}
          <Select
            options={["active", "inactive"]}
            label="Status"
            className="mb-4"
            {...register("status", { required: true })}
          />
          <Button
            type="submit"
            bgColor={post ? "bg-green-600" : "bg-blue-600"}
            className={`w-full text-white font-semibold py-3 rounded-lg shadow transition-colors duration-200 ${
              contentLength > 10000 ? "opacity-60 cursor-not-allowed bg-gray-500" : ""
            }`}
            disabled={contentLength > 10000}
          >
            {post ? "Update Post" : "Submit Post"}
          </Button>
        </div>
      </form>
    </div>
  )
}