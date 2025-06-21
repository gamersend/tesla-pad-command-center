
import { useState, useCallback } from 'react';

export interface SwipeState {
  currentPage: number;
  totalPages: number;
  isAnimating: boolean;
}

export const useSwipeNavigation = (totalPages: number, initialPage: number = 0) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isAnimating, setIsAnimating] = useState(false);

  const navigateToPage = useCallback((pageIndex: number) => {
    if (isAnimating || pageIndex === currentPage || pageIndex < 0 || pageIndex >= totalPages) {
      return;
    }

    setIsAnimating(true);
    setCurrentPage(pageIndex);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [currentPage, isAnimating, totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      navigateToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, navigateToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      navigateToPage(currentPage - 1);
    }
  }, [currentPage, navigateToPage]);

  return {
    currentPage,
    totalPages,
    isAnimating,
    navigateToPage,
    nextPage,
    prevPage
  };
};
