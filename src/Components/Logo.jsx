import React from 'react'

function Logo({ width, showText = true, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 text-white shadow-md shadow-blue-500/20">
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </div>
      {showText && (
        <span className="font-bold tracking-tight text-gray-900 dark:text-white text-lg sm:text-xl">
          Vaibhav<span className="text-blue-600 dark:text-blue-400 font-extrabold">.dev</span>
        </span>
      )}
    </div>
  )
}

export default Logo
