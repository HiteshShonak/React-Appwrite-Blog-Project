import React from "react";

function Button({
    children,
    type = 'button',
    bgcolor = 'bg-blue-600',
    textColor = 'text-white',
    className = '',
    defaultClassesActive = true,
    onClick,
    ...props
}) {
    const defaultClasses = 'px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
    
    return (
        <button 
            type={type}
            onClick={onClick}
            className={`${defaultClassesActive ? defaultClasses : ''} ${bgcolor} ${textColor} ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
