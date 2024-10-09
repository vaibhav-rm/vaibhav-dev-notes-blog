import React, {useId} from 'react'

const Input = React.forwardRef( function Input({
    label,
    type = 'text',
    className = '',
    ...props
}, ref){
    const id = useId()
    return (
        <div className='w-full flex align-center justify-between'>
            {label && <label 
            className='inline-block font-bold basis-1/3'
            htmlFor={id}
            > 
                {label}
                </label>}

                <input 
                type={type}
                className={`p-3 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
                ref={ref}
                {...props}
                id={id}
                />
        </div>
    )
})

export default Input