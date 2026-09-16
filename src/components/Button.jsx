import React from 'react';
import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon, 
  ...props 
}) {
  const classes = `btn btn-${variant} btn-${size} ${className}`;
  return (
    <button className={classes} {...props}>
      {children}
      {icon && <span className="btn-icon">{icon}</span>}
    </button>
  );
}