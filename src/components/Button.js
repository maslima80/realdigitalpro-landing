// components/Button.js
import React from 'react';
import classNames from 'classnames';

export const Button = ({ children, onClick, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'px-4 py-2 rounded',
        'transition-colors duration-200',
        { 'opacity-50 cursor-not-allowed': disabled },
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
