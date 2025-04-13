import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporta datos a formato CSV
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {Array} columns - Array de objetos con la configuración de columnas {header, key}
 * @param {string} filename - Nombre del archivo de salida
 */
export const exportToCSV = (data, columns, filename) => {
  if (!data || data.length === 0) {
    console.error('No hay datos para exportar');
    return;
  }

  try {
    // Convertir datos al formato esperado por XLSX
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => {
        const row = {};
        columns.forEach(column => {
          row[column.header] = item[column.key];
        });
        return row;
      })
    );
    
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    // Crear blob y descargar
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  } catch (error) {
    console.error('Error al exportar a CSV:', error);
  }
};

/**
 * Exporta datos a formato Excel
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {Array} columns - Array de objetos con la configuración de columnas {header, key}
 * @param {string} filename - Nombre del archivo de salida
 * @param {string} sheetName - Nombre de la hoja de cálculo
 */
export const exportToExcel = (data, columns, filename, sheetName = 'Datos') => {
  if (!data || data.length === 0) {
    console.error('No hay datos para exportar');
    return;
  }

  try {
    // Convertir datos al formato esperado por XLSX
    const formattedData = data.map(item => {
      const row = {};
      columns.forEach(column => {
        row[column.header] = item[column.key];
      });
      return row;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Crear blob y descargar
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
  }
};

/**
 * Exporta datos a formato PDF
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {Array} columns - Array de objetos con la configuración de columnas {header, key}
 * @param {string} filename - Nombre del archivo de salida
 * @param {Object} options - Opciones de configuración para el PDF
 */
export const exportToPDF = (data, columns, filename, options = {}) => {
  if (!data || data.length === 0) {
    console.error('No hay datos para exportar');
    return;
  }

  try {
    const {
      title = 'Reporte',
      subtitle = '',
      orientation = 'portrait',
      pageSize = 'a4',
      margins = {
        top: 30,
        bottom: 30,
        left: 20,
        right: 20
      },
      headerColor = [217, 79, 112],
      textColor = [80, 80, 80],
      includeDate = true
    } = options;

    // Crear nueva instancia de PDF
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize
    });

    // Configurar metadatos
    doc.setProperties({
      title: title,
      subject: subtitle,
      author: 'Madame Pastel',
      creator: 'Sistema de Reportes'
    });

    // Añadir título y subtítulo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text(title, margins.left, 20);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(subtitle, margins.left, 28);
    }

    // Añadir fecha si está habilitado
    if (includeDate) {
      const date = new Date().toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado: ${date}`, doc.internal.pageSize.width - margins.right - 40, 20);
    }

    // Preparar datos para la tabla
    const tableHeaders = columns.map(col => col.header);
    const tableData = data.map(item => 
      columns.map(col => {
        // Formatear valor si es fecha o número
        const value = item[col.key];
        if (value instanceof Date) {
          return value.toLocaleDateString('es-AR');
        } else if (typeof value === 'number' && col.isCurrency) {
          return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
        }
        return value;
      })
    );

    // Configurar y generar tabla
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: subtitle ? 35 : 30,
      margin: margins,
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      rowPageBreak: 'auto',
      bodyStyles: {
        textColor: textColor
      },
      theme: 'grid'
    });

    // Agregar pie de página con número de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${totalPages}`, 
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }

    // Guardar archivo
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
  }
};

/**
 * Formatear fecha para mostrar en reportes
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  switch (format) {
    case 'full':
      return dateObj.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'medium':
      return dateObj.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    case 'time':
      return dateObj.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'datetime':
      return `${dateObj.toLocaleDateString('es-AR')} ${dateObj.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    case 'short':
    default:
      return dateObj.toLocaleDateString('es-AR');
  }
};

/**
 * Formatear número como moneda
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado como moneda
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value);
};
