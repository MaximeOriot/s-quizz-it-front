import React from 'react';

interface LoadingAnimationProps {
  message?: string;
  subMessage?: string;
  variant?: 'dots' | 'pulse' | 'wave' | 'spinner';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = "Chargement en cours",
  subMessage,
  variant = 'dots',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderAnimation = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce bg-primary" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce bg-primary" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce bg-primary" style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full animate-pulse bg-primary"></div>
            <div className="w-3 h-3 rounded-full animate-pulse bg-primary" style={{ animationDelay: '200ms' }}></div>
            <div className="w-3 h-3 rounded-full animate-pulse bg-primary" style={{ animationDelay: '400ms' }}></div>
          </div>
        );
      
      case 'wave':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-6 rounded-full animate-pulse bg-primary" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-6 rounded-full animate-pulse bg-primary" style={{ animationDelay: '100ms' }}></div>
            <div className="w-1 h-6 rounded-full animate-pulse bg-primary" style={{ animationDelay: '200ms' }}></div>
            <div className="w-1 h-6 rounded-full animate-pulse bg-primary" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 h-6 rounded-full animate-pulse bg-primary" style={{ animationDelay: '400ms' }}></div>
          </div>
        );
      
      case 'spinner':
        return (
          <div className="w-8 h-8 rounded-full border-4 border-gray-300 animate-spin border-t-primary"></div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-6">
      <div className="mb-4">
        {renderAnimation()}
      </div>
      
      <div className="text-center">
        <p className={`mb-1 font-medium text-primary ${sizeClasses[size]}`}>
          {message}
        </p>
        {subMessage && (
          <p className="text-sm text-gray-500 animate-pulse">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation; 