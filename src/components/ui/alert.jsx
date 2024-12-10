import React from 'react';

const Alert = ({ children, variant, className }) => {
  const variants = {
    destructive: 'bg-red-100 border-l-4 border-red-500 text-red-700',
    success: 'bg-green-100 border-l-4 border-green-500 text-green-700',
    info: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700',
    warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
  };

  return (
    <div className={`${variants[variant] || 'bg-gray-100'} p-4 rounded ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);

export default Alert;
