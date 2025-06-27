import React from 'react';
import GameCard from './GameCard';

interface BentoItemProps {
  title: string;
  description: string;
  tag?: string;
  tagPosition?: 'left' | 'center' | 'right' | 'none';
  variant: 'primary' | 'secondary';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  height?: string;
  onClick?: () => void;
  hover?: boolean;
  colSpan?: number;
  order?: number;
  mobileOrder?: number;
  alignment?: 'start' | 'center' | 'end';
  mobileAlignment?: 'start' | 'center' | 'end';
}

interface BentoProps {
  items: BentoItemProps[];
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const Bento: React.FC<BentoProps> = ({
  items,
  className = '',
  gap = 'md',
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const getColSpanClass = (colSpan: number) => {
    const colSpanMap: { [key: number]: string } = {
      1: 'md:col-span-1',
      2: 'md:col-span-2',
      3: 'md:col-span-3',
      4: 'md:col-span-4',
      5: 'md:col-span-5',
    };
    return colSpanMap[colSpan] || 'md:col-span-1';
  };

  const getMobileOrderClass = (order: number) => {
    const orderMap: { [key: number]: string } = {
      1: 'order-1',
      2: 'order-2',
      3: 'order-3',
      4: 'order-4',
      5: 'order-5',
    };
    return orderMap[order] || 'order-1';
  };

  const getDesktopOrderClass = (order: number) => {
    const orderMap: { [key: number]: string } = {
      1: 'md:order-1',
      2: 'md:order-2',
      3: 'md:order-3',
      4: 'md:order-4',
      5: 'md:order-5',
    };
    return orderMap[order] || 'md:order-1';
  };

  const alignmentClasses = {
    start: 'self-start',
    center: 'self-center',
    end: 'self-end',
  };

  return (
    <div className={`w-full max-w-6xl flex flex-col md:grid md:grid-cols-5 md:justify-items-center ${gapClasses[gap]} ${className}`}>
      {items.map((item, index) => {
        const mobileOrder = item.mobileOrder || item.order || index + 1;
        const desktopOrder = item.order || index + 1;
        const mobileAlignment = item.mobileAlignment || item.alignment || 'start';
        const desktopAlignment = item.alignment || 'start';
        
        return (
          <div 
            key={index}
            className={`w-[90%] ${getColSpanClass(item.colSpan || 1)} ${getMobileOrderClass(mobileOrder)} ${getDesktopOrderClass(desktopOrder)} ${alignmentClasses[mobileAlignment]} md:${alignmentClasses[desktopAlignment]}`}
          >
            <GameCard 
              title={item.title}
              description={item.description}
              tag={item.tag}
              tagPosition={item.tagPosition}
              variant={item.variant}
              padding={item.padding}
              height={item.height}
              onClick={item.onClick}
              hover={item.hover}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Bento; 