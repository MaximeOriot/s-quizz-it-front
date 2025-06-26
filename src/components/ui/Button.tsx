import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  textSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  width?: 'full' | 'auto' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  textSize = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  width = 'auto',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-3xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary text-secondary hover:bg-primary-foreground focus:ring-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-foreground focus:ring-secondary-foreground',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const textSizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2 text-2xl',
  };
  
  const widthClasses = {
    full: 'w-full',
    auto: 'w-auto',
    '2xl': 'w-32',
    '3xl': 'w-40',
    '4xl': 'w-48',
    '5xl': 'w-56',
    '6xl': 'w-64',
    '7xl': 'w-72',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    textSizeClasses[textSize],
    widthClasses[width],
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button; 