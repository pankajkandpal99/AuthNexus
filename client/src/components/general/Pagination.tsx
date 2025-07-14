import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

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
  className,
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const getMaxVisiblePages = () => {
    if (windowWidth < 640) return 0; // xs: No pages
    if (windowWidth < 768) return 3; // sm: Show 3 pages
    if (windowWidth < 1024) return 5; // md: Show 5 pages
    return 7; // lg+: Show 7 pages
  };

  const getVisiblePages = () => {
    const maxVisiblePages = getMaxVisiblePages();
    if (maxVisiblePages === 0) return [];

    const pages = [];

    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }

    // Calculate the middle pages
    let startPage = Math.max(
      2,
      currentPage - Math.floor((maxVisiblePages - 2) / 2)
    );
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

    // Adjust start if we're near the end
    if (endPage === totalPages - 1) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3));
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("ellipsis1");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push("ellipsis2");
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const renderPageButton = (page: number | string, index: number) => {
    if (page === "ellipsis1" || page === "ellipsis2") {
      return (
        <div
          key={`ellipsis-${index}`}
          className="flex items-center justify-center"
        >
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </div>
      );
    }

    const pageNumber = page as number;
    return (
      <Button
        key={`page-${pageNumber}`}
        variant={pageNumber === currentPage ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(pageNumber)}
        className={`${
          pageNumber === currentPage
            ? "bg-primary text-gray-200 hover:bg-amber-600"
            : ""
        }`}
      >
        {pageNumber}
      </Button>
    );
  };

  const renderMobilePagination = () => {
    return (
      <div className="sm:hidden flex items-center justify-center px-2">
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      className={`flex flex-col sm:flex-row items-center w-full gap-y-2 gap-x-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between w-full sm:justify-center gap-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {renderMobilePagination()}

        <div className="hidden sm:flex gap-x-2 items-center">
          {getVisiblePages().map((page, index) =>
            renderPageButton(page, index)
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
