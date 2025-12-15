import React from "react";

function Button({
    children,
    type = 'button',
    bgColor = 'bg-blue-600', // Default color
    textColor = 'text-white',
    className = '',
    ...props
}) {
    return (
        <button 
            type={type}
            className={`px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${bgColor} ${textColor} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;