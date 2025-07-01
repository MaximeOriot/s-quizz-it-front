import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Chargement...", 
  size = 'md',
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white'
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className={`rounded-full border-2 border-gray-300 animate-spin ${sizeClasses[size]} ${variantClasses[variant]} border-t-transparent`}></div>
      {message && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 