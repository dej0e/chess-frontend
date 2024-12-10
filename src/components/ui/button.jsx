import React from 'react';
import { cx } from 'class-variance-authority';

const Button = ({ children, className, onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={cx(
        'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
