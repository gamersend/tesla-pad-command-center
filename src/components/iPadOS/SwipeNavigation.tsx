
import React, { useState, useRef, useEffect } from 'react';

interface SwipeNavigationProps {
  children: React.ReactNode[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  currentPage = 0,
  onPageChange
}) => {
  const [activePage, setActivePage] = useState(currentPage);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = children.length;
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activePage < totalPages - 1) {
      navigateToPage(activePage + 1);
    }
    if (isRightSwipe && activePage > 0) {
      navigateToPage(activePage - 1);
    }
  };

  const navigateToPage = (pageIndex: number) => {
    if (isAnimating || pageIndex === activePage) return;

    setIsAnimating(true);
    setActivePage(pageIndex);
    onPageChange?.(pageIndex);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    if (containerRef.current) {
      const translateX = -activePage * 100;
      containerRef.current.style.transform = `translateX(${translateX}%)`;
      containerRef.current.style.transition = isAnimating ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    }
  }, [activePage, isAnimating]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex w-full h-full"
        style={{ width: `${totalPages * 100}%` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Page Indicators */}
      <div className="page-indicators">
        {children.map((_, index) => (
          <button
            key={index}
            className={`page-indicator ${index === activePage ? 'active' : ''}`}
            onClick={() => navigateToPage(index)}
          />
        ))}
      </div>
    </div>
  );
};
