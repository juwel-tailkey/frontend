type TablePaginationTopProps = {
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  itemsPerPageOptions: readonly number[];
};

export function TablePaginationTop({
  itemsPerPage,
  onItemsPerPageChange,
  startIndex,
  endIndex,
  totalItems,
  itemsPerPageOptions,
}: TablePaginationTopProps) {
  return (
    <div className="table-pagination-top">
      <label className="table-pagination-label">
        Show
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))} className="table-pagination-select">
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        per page
      </label>
      {totalItems > 0 && (
        <span className="table-pagination-info">
          Showing {startIndex}-{endIndex} of {totalItems} items
        </span>
      )}
    </div>
  );
}

type TablePaginationBottomProps = {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function TablePaginationBottom({ currentPage, totalPages, onPrevious, onNext }: TablePaginationBottomProps) {
  return (
    <div className="table-pagination-bottom">
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="table-pagination-btn table-pagination-btn-prev"
      >
        ← Previous
      </button>
      <span className="table-pagination-page-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages || totalPages === 0}
        className="table-pagination-btn table-pagination-btn-next"
      >
        Next →
      </button>
    </div>
  );
}
