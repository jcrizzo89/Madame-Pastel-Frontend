import React from 'react';
import '../../../styles/admin/Pagination.css';

/**
 * Componente de paginación mejorado para reportes y listas de datos
 * @param {Object} props
 * @param {number} props.currentPage - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {Function} props.onPageChange - Función que se ejecuta al cambiar de página
 * @param {number} props.siblingCount - Cantidad de números de página adyacentes a mostrar (opcional)
 * @param {number} props.totalItems - Total de items (opcional)
 * @param {number} props.pageSize - Tamaño de página (opcional)
 * @param {Function} props.onPageSizeChange - Función para cambiar el tamaño de página (opcional)
 * @param {Array} props.pageSizeOptions - Opciones de tamaño de página (opcional)
 */
const Pagination = ({ 
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  // Generar rango de números para la paginación
  const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  // Calcular los números de página a mostrar
  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3; // Números antes y después + página actual + primera y última
    const totalBlocks = totalNumbers + 2; // +2 para los puntos suspensivos

    if (totalPages <= totalBlocks) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, '...', ...middleRange, '...', totalPages];
    }
  };

  const pageNumbers = getPageNumbers();

  // Ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Ir a la primera página
  const goToFirstPage = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  // Ir a la última página
  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };

  // Cambiar el tamaño de página
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  // Si solo hay una página, no mostrar la paginación
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        {totalItems && pageSize && (
          <span className="pagination-item-info">
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems} items
          </span>
        )}
        
        {onPageSizeChange && (
          <div className="pagination-size-selector">
            <span>Items por página:</span>
            <select value={pageSize} onChange={handlePageSizeChange}>
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="pagination-controls">
        <button 
          className="pagination-button pagination-nav-button" 
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          aria-label="Primera página"
        >
          <i className="fas fa-angle-double-left"></i>
        </button>
        
        <button 
          className="pagination-button pagination-nav-button"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <i className="fas fa-angle-left"></i>
        </button>
        
        <div className="pagination-numbers">
          {pageNumbers?.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <span key={index} className="pagination-ellipsis">
                  &hellip;
                </span>
              );
            }
            return (
              <button
                key={index}
                onClick={() => onPageChange(pageNumber)}
                className={`pagination-button ${currentPage === pageNumber ? 'pagination-active' : ''}`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
        
        <button 
          className="pagination-button pagination-nav-button"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
        >
          <i className="fas fa-angle-right"></i>
        </button>
        
        <button 
          className="pagination-button pagination-nav-button"
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          aria-label="Última página"
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
