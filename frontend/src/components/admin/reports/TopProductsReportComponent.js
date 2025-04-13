import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

// Registrar los componentes de ChartJS necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProductsReportComponent = ({ dateRange }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState('quantity'); // 'quantity' o 'revenue'
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchTopProducts();
  }, [dateRange, metrics, limit]);

  const fetchTopProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/orders/most-sold-products`, {
        params: {
          fromDate: dateRange.from,
          toDate: dateRange.to,
          sortBy: metrics,
          limit
        }
      });
      
      setTopProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar los productos más vendidos');
      console.error('Error fetching top products:', error);
      setLoading(false);
    }
  };

  // Configuración de datos para el gráfico de barras
  const chartData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: metrics === 'quantity' ? 'Cantidad Vendida' : 'Ingresos Generados',
        data: topProducts.map(product => metrics === 'quantity' ? product.quantity : product.revenue),
        backgroundColor: topProducts.map((_, index) => {
          // Generar colores degradados del rosa al azul
          const hue = 350 - (index * 15);
          return `hsl(${hue}, 70%, 60%)`;
        }),
        borderWidth: 1
      }
    ]
  };

  // Opciones para el gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Para que las barras sean horizontales
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: metrics === 'quantity' 
          ? 'Productos Más Vendidos por Cantidad' 
          : 'Productos Más Vendidos por Ingresos'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              if (metrics === 'revenue') {
                label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.x);
              } else {
                label += context.parsed.x;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: metrics === 'quantity' ? 'Cantidad Vendida' : 'Ingresos ($)'
        },
        ticks: {
          callback: function(value) {
            if (metrics === 'revenue') {
              return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
            }
            return value;
          }
        }
      }
    }
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (topProducts.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Producto,Categoría,Cantidad Vendida,Ingresos,Precio Unitario\n";
    
    topProducts.forEach(product => {
      csvContent += `"${product.name}","${product.category || 'Sin categoría'}",${product.quantity},${product.revenue},${product.price}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `productos_mas_vendidos_${dateRange.from}_${dateRange.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Datos exportados correctamente');
  };

  return (
    <div className="top-products-report">
      <div className="report-section-header">
        <h2>Productos Más Vendidos</h2>
        <p>Identifica los productos estrella de tu negocio en el período seleccionado.</p>
      </div>

      <div className="report-actions">
        <div className="metrics-selector">
          <button 
            className={`metrics-button ${metrics === 'quantity' ? 'active' : ''}`}
            onClick={() => setMetrics('quantity')}
          >
            Por Cantidad
          </button>
          <button 
            className={`metrics-button ${metrics === 'revenue' ? 'active' : ''}`}
            onClick={() => setMetrics('revenue')}
          >
            Por Ingresos
          </button>
        </div>
        
        <div className="limit-selector">
          <label>Mostrar:</label>
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
        
        <button className="export-button" onClick={exportToCSV}>
          <i className="fas fa-file-export"></i>
          Exportar CSV
        </button>
      </div>

      <div className="chart-container" style={{ height: '500px' }}>
        {loading ? (
          <div className="report-loading">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : topProducts.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="no-data-message">
            <i className="fas fa-info-circle"></i>
            <p>No hay datos de ventas para el período seleccionado</p>
          </div>
        )}
      </div>

      {!loading && topProducts.length > 0 && (
        <div className="top-products-table-container">
          <h3>Detalle de Productos</h3>
          <table className="report-data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad Vendida</th>
                <th>Ingresos Generados</th>
                <th>Precio Unitario</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="product-name-cell">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="product-thumbnail" 
                        />
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category || 'Sin categoría'}</td>
                  <td>{product.quantity}</td>
                  <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.revenue)}</td>
                  <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopProductsReportComponent;
