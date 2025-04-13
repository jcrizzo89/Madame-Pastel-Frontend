import React, { useState, useRef } from 'react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../utils/exportUtils';
import '../../../styles/admin/ReportExport.css';

/**
 * Componente para exportar datos de reportes en diferentes formatos
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos a exportar
 * @param {Array} props.columns - Definición de columnas para la exportación
 * @param {string} props.filename - Nombre base del archivo a exportar
 * @param {string} props.title - Título del reporte (para PDF)
 * @param {string} props.subtitle - Subtítulo del reporte (para PDF)
 */
const ReportExport = ({ 
  data, 
  columns, 
  filename = 'reporte', 
  title = 'Reporte Madame Pastel',
  subtitle = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Manejar clic fuera del dropdown para cerrarlo
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleExportCSV = () => {
    exportToCSV(data, columns, filename);
    setShowDropdown(false);
  };

  const handleExportExcel = () => {
    exportToExcel(data, columns, filename, 'Reporte');
    setShowDropdown(false);
  };

  const handleExportPDF = () => {
    exportToPDF(data, columns, filename, {
      title: title,
      subtitle: subtitle,
      orientation: 'landscape',
      includeDate: true
    });
    setShowDropdown(false);
  };

  const handlePrint = () => {
    setShowDropdown(false);
    window.print();
  };

  return (
    <div className="report-export" ref={dropdownRef}>
      <button className="export-menu-button" onClick={toggleDropdown}>
        <i className="fas fa-download"></i>
        Exportar
      </button>

      {showDropdown && (
        <div className="export-dropdown">
          <button onClick={handleExportCSV}>
            <i className="fas fa-file-csv"></i>
            Exportar CSV
          </button>
          <button onClick={handleExportExcel}>
            <i className="fas fa-file-excel"></i>
            Exportar Excel
          </button>
          <button onClick={handleExportPDF}>
            <i className="fas fa-file-pdf"></i>
            Exportar PDF
          </button>
          <button onClick={handlePrint}>
            <i className="fas fa-print"></i>
            Imprimir
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportExport;
