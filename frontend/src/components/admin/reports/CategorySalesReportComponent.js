import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

// Registrar los componentes de ChartJS necesarios
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const CategorySalesReportComponent = ({ dateRange }) => {
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartDisplay, setChartDisplay] = useState('pie'); // 'pie' o 'bar'
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' o 'quantity'

  useEffect(() => {
    fetchCategorySales();
  }, [dateRange, sortBy]);

  const fetchCategorySales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/orders/sales-by-category`, {
        params: {
          fromDate: dateRange.from,
          toDate: dateRange.to,
          sortBy
        }
      });
      
      setCategorySales(response.data.categories);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar las ventas por categoría');
      console.error('Error fetching category sales:', error);
      setLoading(false);
    }
  };

  // Generar colores distintivos para cada categoría
  const generateColors = (count) => {
    const baseColors = [
      '#d94f70', '#4fa1d9', '#ffab40', '#66bb6a', 
      '#ba68c8', '#26c6da', '#7986cb', '#e57373',
      '#9575cd', '#4db6ac', '#ff8a65', '#aed581'
    ];
    
    // Si hay más categorías que colores base, generar colores adicionales
    const colors = [...baseColors];
    if (count > baseColors.length) {
      for (let i = baseColors.length; i < count; i++) {
        const hue = (i * 37) % 360; // Distribuir uniformemente alrededor del círculo de color
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
    }
    
    return {
      backgroundColor: colors.map(color => `${color}99`), // Con transparencia
      borderColor: colors
    };
  };

  // Datos para el gráfico de pastel
  const pieData = {
    labels: categorySales.map(cat => cat.name || 'Sin categoría'),
    datasets: [
      {
        data: categorySales.map(cat => sortBy === 'revenue' ? cat.totalRevenue : cat.totalQuantity),
        ...generateColors(categorySales.length),
        borderWidth: 1,
      },
    ],
  };

  // Datos para el gráfico de barras
  const barData = {
    labels: categorySales.map(cat => cat.name || 'Sin categoría'),
    datasets: [
      {
        label: sortBy === 'revenue' ? 'Ingresos por Categoría' : 'Cantidad Vendida por Categoría',
        data: categorySales.map(cat => sortBy === 'revenue' ? cat.totalRevenue : cat.totalQuantity),
        ...generateColors(categorySales.length),
        borderWidth: 1,
      },
    ],
  };

  // Opciones para el gráfico de pastel
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map(function(label, i) {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                const value = data.datasets[0].data[i];
                
                // Formatear el valor según el tipo de dato
                let formattedValue;
                if (sortBy === 'revenue') {
                  formattedValue = new Intl.NumberFormat('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS',
                    maximumFractionDigits: 0
                  }).format(value);
                } else {
                  formattedValue = value;
                }
                
                return {
                  text: `${label}: ${formattedValue}`,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  lineWidth: style.borderWidth,
                  hidden: isNaN(value) || meta.data[i].hidden,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: sortBy === 'revenue' ? 'Ingresos por Categoría' : 'Cantidad Vendida por Categoría'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            
            if (sortBy === 'revenue') {
              return `${label}: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)} (${percentage}%)`;
            } else {
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  // Opciones para el gráfico de barras
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: sortBy === 'revenue' ? 'Ingresos por Categoría' : 'Cantidad Vendida por Categoría'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (sortBy === 'revenue') {
              label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y);
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: sortBy === 'revenue' ? 'Ingresos ($)' : 'Cantidad Vendida'
        },
        ticks: {
          callback: function(value) {
            if (sortBy === 'revenue') {
              return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
            }
            return value;
          }
        }
      }
    }
  };

  // Calcular el total de ventas e ingresos
  const totalRevenue = categorySales.reduce((sum, cat) => sum + cat.totalRevenue, 0);
  const totalQuantity = categorySales.reduce((sum, cat) => sum + cat.totalQuantity, 0);

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (categorySales.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Categoría,Productos Vendidos,Ingresos,% del Total (Cantidad),% del Total (Ingresos)\n";
    
    categorySales.forEach(cat => {
      const percentageQuantity = totalQuantity > 0 ? (cat.totalQuantity / totalQuantity * 100).toFixed(2) : '0.00';
      const percentageRevenue = totalRevenue > 0 ? (cat.totalRevenue / totalRevenue * 100).toFixed(2) : '0.00';
      
      csvContent += `"${cat.name || 'Sin categoría'}",${cat.totalQuantity},${cat.totalRevenue},${percentageQuantity}%,${percentageRevenue}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ventas_por_categoria_${dateRange.from}_${dateRange.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Datos exportados correctamente');
  };

  return (
    <div className="category-sales-report">
      <div className="report-section-header">
        <h2>Ventas por Categoría</h2>
        <p>Analiza cómo se distribuyen tus ventas entre diferentes categorías de productos.</p>
      </div>

      <div className="report-actions">
        <div className="chart-display-selector">
          <button 
            className={`chart-display-button ${chartDisplay === 'pie' ? 'active' : ''}`}
            onClick={() => setChartDisplay('pie')}
          >
            <i className="fas fa-chart-pie"></i>
            Gráfico Circular
          </button>
          <button 
            className={`chart-display-button ${chartDisplay === 'bar' ? 'active' : ''}`}
            onClick={() => setChartDisplay('bar')}
          >
            <i className="fas fa-chart-bar"></i>
            Gráfico de Barras
          </button>
        </div>
        
        <div className="sort-selector">
          <button 
            className={`sort-button ${sortBy === 'revenue' ? 'active' : ''}`}
            onClick={() => setSortBy('revenue')}
          >
            Por Ingresos
          </button>
          <button 
            className={`sort-button ${sortBy === 'quantity' ? 'active' : ''}`}
            onClick={() => setSortBy('quantity')}
          >
            Por Cantidad
          </button>
        </div>
        
        <button className="export-button" onClick={exportToCSV}>
          <i className="fas fa-file-export"></i>
          Exportar CSV
        </button>
      </div>

      <div className="category-summary-cards">
        <div className="summary-card">
          <div className="summary-card-title">Categorías con Ventas</div>
          <div className="summary-card-value">{categorySales.length}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">Total de Productos Vendidos</div>
          <div className="summary-card-value">{totalQuantity}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">Ingresos Totales</div>
          <div className="summary-card-value">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalRevenue)}
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ height: '400px' }}>
        {loading ? (
          <div className="report-loading">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : categorySales.length > 0 ? (
          chartDisplay === 'pie' ? (
            <Pie data={pieData} options={pieOptions} />
          ) : (
            <Bar data={barData} options={barOptions} />
          )
        ) : (
          <div className="no-data-message">
            <i className="fas fa-info-circle"></i>
            <p>No hay datos de ventas por categoría para el período seleccionado</p>
          </div>
        )}
      </div>

      {!loading && categorySales.length > 0 && (
        <div className="category-sales-table-container">
          <h3>Detalle por Categoría</h3>
          <table className="report-data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Productos Vendidos</th>
                <th>% del Total (Cantidad)</th>
                <th>Ingresos</th>
                <th>% del Total (Ingresos)</th>
              </tr>
            </thead>
            <tbody>
              {categorySales.map((category, index) => {
                const percentageQuantity = totalQuantity > 0 ? (category.totalQuantity / totalQuantity * 100).toFixed(2) : '0.00';
                const percentageRevenue = totalRevenue > 0 ? (category.totalRevenue / totalRevenue * 100).toFixed(2) : '0.00';
                
                return (
                  <tr key={index}>
                    <td>{category.name || 'Sin categoría'}</td>
                    <td>{category.totalQuantity}</td>
                    <td>
                      <div className="percentage-bar">
                        <div className="percentage-bar-fill" style={{ width: `${percentageQuantity}%`, backgroundColor: pieData.datasets[0].borderColor[index] }}></div>
                        <span>{percentageQuantity}%</span>
                      </div>
                    </td>
                    <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(category.totalRevenue)}</td>
                    <td>
                      <div className="percentage-bar">
                        <div className="percentage-bar-fill" style={{ width: `${percentageRevenue}%`, backgroundColor: pieData.datasets[0].borderColor[index] }}></div>
                        <span>{percentageRevenue}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td>Total</td>
                <td>{totalQuantity}</td>
                <td>100%</td>
                <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalRevenue)}</td>
                <td>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategorySalesReportComponent;
