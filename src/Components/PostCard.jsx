import React from 'react'
import appwriteService from '../appwrite/conf'
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage}) {
  return (

    <div class="cursor-pointer group relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96 hover:shadow-lg transition-shadow duration-300">
  <div class="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
    <img class="transition-transform duration-500 ease-[cubic-bezier(0.25, 1, 0.5, 1)] transform group-hover:scale-110" 
         src={appwriteService.getFilePreview(featuredImage)} alt={title} />
  </div>
  <div class="p-4">
    <h6 class="mb-2 text-slate-800 text-xl font-semibold">
      {title}
    </h6>
    <p class="text-slate-600 leading-normal font-light">
      We are thrilled to announce the completion of our seed round, securing $2M in investment to fuel product development and market expansion.
    </p>
  </div>
  <div class="px-4 pb-4 pt-0 mt-2">
  <Link to={`/post/${$id}`}>
    <button class="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
      Read article
    </button>
    </Link>
  </div>
</div> 

  )
}

export default PostCard