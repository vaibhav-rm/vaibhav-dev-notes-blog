import React from 'react'

function Button({
    children,
    type = 'button',
    bgColor = 'bg-black',
    textColor = 'text-white',
    className = '',
    ...props
}) {
  return (
    <button className= {`px-4 py-2 font-bold text-xl rounded-lg ${bgColor} ${textColor} ${className}`} {...props}> 
        {children}
    </button>
  )
}

export default Button