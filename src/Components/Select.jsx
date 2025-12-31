import React, { useId, forwardRef } from "react"

function Select({
    options,
    label,
    className = '',
    ...props
}, ref) {
    const id = useId();
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className='inline-block mb-1.5 pl-1 text-sm font-medium text-gray-700'>
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={id}
                    ref={ref}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer ${className}`}
                    {...props}
                >
                    {options?.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    )
}

export default forwardRef(Select)