import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center rounded-xl h-12 px-5 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 font-bold transition-all"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-2">
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400 font-bold">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => onPageChange(page as number)}
                className={`w-12 h-12 p-0 rounded-xl font-bold transition-all ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center rounded-xl h-12 px-5 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 font-bold transition-all"
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="h-5 w-5 ml-1" />
      </Button>
    </div>
  );
};
