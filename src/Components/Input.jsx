import React, { forwardRef, useId } from 'react'

const Input = forwardRef(function Input({
    label, 
    type = "text", 
    className = '', 
    ...props}, 
    ref) {
        const id = useId();
        return (
            <div className='w-full'>
                {label && (
                    <label 
                        htmlFor={id} 
                        className='inline-block mb-1.5 pl-1 text-sm font-medium text-gray-700'
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    ref={ref}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
                    id={id}
                    {...props}
                />
            </div>
        );
});

export default Input