import React from 'react';

function Container({ children, className = '' }) {
  return (
    <div className={`w-full px-2 ${className}`}>
      {children}
    </div>
  );
}

export default Container;
