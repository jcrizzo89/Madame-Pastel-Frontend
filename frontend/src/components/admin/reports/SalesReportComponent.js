import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

// Registrar los componentes de ChartJS necesarios
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  TimeScale
);

const SalesReportComponent = ({ dateRange }) => {
  const [salesData, setSalesData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [viewType, setViewType] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [totals, setTotals] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrder: 0,
  });

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, viewType]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/orders/sales-statistics`, {
        params: {
          fromDate: dateRange.from,
          toDate: dateRange.to,
          groupBy: viewType
        }
      });
      
      setSalesData({
        ...salesData,
        [viewType]: response.data.salesData
      });
      
      // Calcular totales
      const totalSales = response.data.salesData.reduce(
        (sum, item) => sum + item.amount, 0
      );
      
      const totalOrders = response.data.salesData.reduce(
        (sum, item) => sum + item.orderCount, 0
      );
      
      setTotals({
        totalSales,
        totalOrders,
        averageOrder: totalOrders > 0 ? totalSales / totalOrders : 0
      });
      
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar los datos de ventas');
      console.error('Error fetching sales data:', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: salesData[viewType].map(item => item.period),
    datasets: [
      {
        label: 'Ventas ($)',
        data: salesData[viewType].map(item => item.amount),
        borderColor: '#d94f70',
        backgroundColor: 'rgba(217, 79, 112, 0.5)',
        tension: 0.3,
        fill: chartType === 'area'
      },
      {
        label: 'Cantidad de Órdenes',
        data: salesData[viewType].map(item => item.orderCount),
        borderColor: '#4fa1d9',
        backgroundColor: 'rgba(79, 161, 217, 0.5)',
        tension: 0.3,
        fill: chartType === 'area',
        yAxisID: 'y1',
      }
    ]
  };

  // Opciones para el gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Ventas ${viewType === 'daily' ? 'Diarias' : viewType === 'weekly' ? 'Semanales' : 'Mensuales'}`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label.includes('Ventas')) {
                label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
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
          text: 'Monto de Ventas ($)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
          }
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Cantidad de Órdenes'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    const data = salesData[viewType];
    
    if (data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Período,Monto de Ventas,Cantidad de Órdenes\n";
    
    data.forEach(item => {
      csvContent += `${item.period},${item.amount},${item.orderCount}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ventas_${viewType}_${dateRange.from}_${dateRange.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Datos exportados correctamente');
  };

  return (
    <div className="sales-report">
      <div className="report-section-header">
        <h2>Ventas por Período</h2>
        <p>Visualiza tus ventas y analiza su comportamiento en diferentes períodos de tiempo.</p>
      </div>

      <div className="report-actions">
        <div className="view-type-selector">
          <button 
            className={`view-type-button ${viewType === 'daily' ? 'active' : ''}`}
            onClick={() => setViewType('daily')}
          >
            Diario
          </button>
          <button 
            className={`view-type-button ${viewType === 'weekly' ? 'active' : ''}`}
            onClick={() => setViewType('weekly')}
          >
            Semanal
          </button>
          <button 
            className={`view-type-button ${viewType === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewType('monthly')}
          >
            Mensual
          </button>
        </div>
        
        <div className="chart-type-selector">
          <button 
            className={`chart-type-button ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            <i className="fas fa-chart-line"></i>
          </button>
          <button 
            className={`chart-type-button ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            <i className="fas fa-chart-bar"></i>
          </button>
          <button 
            className={`chart-type-button ${chartType === 'area' ? 'active' : ''}`}
            onClick={() => setChartType('area')}
          >
            <i className="fas fa-chart-area"></i>
          </button>
        </div>
        
        <button className="export-button" onClick={exportToCSV}>
          <i className="fas fa-file-export"></i>
          Exportar CSV
        </button>
      </div>

      <div className="sales-summary-cards">
        <div className="summary-card">
          <div className="summary-card-title">Ventas Totales</div>
          <div className="summary-card-value">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totals.totalSales)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">Órdenes Totales</div>
          <div className="summary-card-value">{totals.totalOrders}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">Valor Promedio por Orden</div>
          <div className="summary-card-value">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totals.averageOrder)}
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ height: '400px' }}>
        {loading ? (
          <div className="report-loading">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : salesData[viewType].length > 0 ? (
          chartType === 'bar' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )
        ) : (
          <div className="no-data-message">
            <i className="fas fa-info-circle"></i>
            <p>No hay datos de ventas para el período seleccionado</p>
          </div>
        )}
      </div>

      {!loading && salesData[viewType].length > 0 && (
        <div className="sales-data-table-container">
          <h3>Detalles de Ventas</h3>
          <table className="report-data-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Monto de Ventas</th>
                <th>Cantidad de Órdenes</th>
                <th>Promedio por Orden</th>
              </tr>
            </thead>
            <tbody>
              {salesData[viewType].map((item, index) => (
                <tr key={index}>
                  <td>{item.period}</td>
                  <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.amount)}</td>
                  <td>{item.orderCount}</td>
                  <td>
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                      item.orderCount > 0 ? item.amount / item.orderCount : 0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesReportComponent;
