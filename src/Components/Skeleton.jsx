import { motion } from 'framer-motion'

const Skeleton = ({ className }) => {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}

export const PostCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col w-full h-[480px]">
      {/* Image Skeleton */}
      <Skeleton className="h-48 rounded-none w-full" />
      
      {/* Content Skeleton */}
      <div className="p-3 sm:p-6 flex flex-col flex-grow space-y-4">
        {/* Title Lines */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        {/* Meta Info (Author, Date) */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        {/* Body Text lines */}
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        {/* Continue Reading button link */}
        <div className="mt-auto">
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
    </div>
  )
}

export default Skeleton