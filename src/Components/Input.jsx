import React, { forwardRef, useId } from 'react'

const Input = forwardRef(function Input({
    label, 
    type = "text", 
    placeholder, 
    className = '', 
    ...props}, 
    ref) {
        const id = useId();
  return(
    <div>{label && <label
    htmlFor={props.id}
    className='inline-block mb-2 pl-1'>
        {label}
        </label>}
        <input
            type={type}
            placeholder={placeholder}
            ref={ref}
            className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
            {...props}
            id={id}
        />
    </div>
  
  );
});

export default Input