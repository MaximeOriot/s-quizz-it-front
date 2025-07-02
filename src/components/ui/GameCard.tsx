import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

interface GameCardProps {
  title: string;
  description: string;
  tag?: string;
  tagPosition?: 'left' | 'center' | 'right' | 'none';
  variant: 'primary' | 'secondary';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  height?: string;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  tag,
  tagPosition = 'center',
  variant,
  padding = 'md',
  height,
  className = '',
  onClick,
  hover = false,
}) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const baseClasses = 'rounded-2xl transition-all duration-200 relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-secondary text-primary shadow-lg border border-secondary-foreground',
    secondary: 'bg-secondary-foreground text-primary shadow-lg border border-primary',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const tagPositionClasses = {
    left: 'left-[-10px] pl-6',
    center: 'left-1/2 transform -translate-x-1/2',
    right: 'right-[-12px] pr-10',
    none: 'left-8 text-center',
  };
  
  const isClickable = (isAuthenticated || title === 'Solo') ? 'hover:scale-105 hover:shadow-xl cursor-pointer' : 'cursor-not-allowed';
  const hoverClasses = hover ? `${isClickable}` : '';
  const disabledClasses = !isAuthenticated && title !== 'Solo' ? 'opacity-50' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    disabledClasses,
    height,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      onClick={onClick}
    >
      <div className="">
        <div className="text-2xl font-bold font-syne">
          {title}
        </div>
        <div className="text-base mb-6">
          {description}
        </div>
      </div>
      
      {tag && (
        <div className={`absolute bottom-[-25px] ${tagPositionClasses[tagPosition]} text-base font-syne border border-b-0 rounded-2xl px-4 py-1 pb-6 w-1/2 ${
          variant === 'primary' ? 'bg-primary text-secondary border-secondary' : 'bg-secondary text-primary border-primary'
        }`}>
          {tag}
        </div>
      )}
    </div>
  );
};

export default GameCard; 