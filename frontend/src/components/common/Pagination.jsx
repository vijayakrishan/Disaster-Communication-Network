import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Dashboard.css';

const Pagination = ({ 
  totalRecords, 
  startIndex, 
  endIndex, 
  pageSize, 
  setPageSize, 
  currentPage, 
  setCurrentPage, 
  totalPages 
}) => {
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="pagination-container-dark">
      <div className="pagination-left-info">
        <span>Showing {totalRecords === 0 ? 0 : startIndex + 1}-{endIndex} of {totalRecords} records</span>
        <div className="rows-page-selector-flex">
          <span className="rows-label-text">Rows per page:</span>
          <select 
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rows-dropdown-field"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="pagination-right-buttons">
        <button 
          className="pagination-control-button"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <div className="pagination-numbers-row">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button 
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`number-selector-btn ${currentPage === pageNum ? 'number-selector-btn-active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button 
          className="pagination-control-button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
