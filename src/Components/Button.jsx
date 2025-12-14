function Button({
    children,
    type = 'button',
    bgcolor= 'bg-blue-600',
    hoverbgcolor = 'hover:bg-blue-700',
    textcolor = 'text-white',
    className = '',
    ...props
}) {
  return (
    <button 
      type={type}
      className={`px-4 py-2 ${bgcolor} ${textcolor} rounded ${hoverbgcolor} transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;