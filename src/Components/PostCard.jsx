import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/conf'
import { Link } from 'react-router-dom'
import parse from 'html-react-parser'

function PostCard({ $id, title, featuredImage, content }) {

  const [summary, setSummary] = useState("");

  // Use useEffect to set summary only once after component mounts
  useEffect(() => {
    if (content) {
      setSummary(content);
    }
  }, [content]);

  return (
    <div className="cursor-pointer group relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96 hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
        <img className="transition-transform duration-500 ease-[cubic-bezier(0.25, 1, 0.5, 1)] transform group-hover:scale-110" 
             src={appwriteService.getFilePreview(featuredImage)} alt={title} />
      </div>
      <div className="p-4">
        <h6 className="mb-2 text-slate-800 text-xl font-semibold">
          {title}
        </h6>
        <p className="text-slate-600 leading-normal font-light">
          {parse(summary.split(' ').slice(0, 10).join(' '))}...
        </p>
      </div>
      <div className="px-4 pb-4 pt-0 mt-2">
        <Link to={`/post/${$id}`}>
          <button className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
            Read article
          </button>
        </Link>
      </div>
    </div>
  )
}

export default PostCard;
