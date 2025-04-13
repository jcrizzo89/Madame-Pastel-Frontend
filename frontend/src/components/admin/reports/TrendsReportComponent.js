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
  Filler
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
  Filler
);

const TrendsReportComponent = ({ dateRange }) => {
  const [trendsData, setTrendsData] = useState({
    currentPeriod: [],
    previousPeriod: []
  });
  const [comparisonData, setComparisonData] = useState({
    labels: [],
    current: [],
    previous: []
  });
  const [metrics, setMetrics] = useState('sales'); // 'sales', 'orders', 'average'
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [periodSummary, setPeriodSummary] = useState({
    currentTotal: 0,
    previousTotal: 0,
    changePercentage: 0,
    trend: 'neutral' // 'up', 'down', 'neutral'
  });

  useEffect(() => {
    fetchTrendsData();
  }, [dateRange, metrics, timeframe]);

  // Calcular fechas para período anterior (para comparación)
  const calculatePreviousPeriod = () => {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    
    const previousFromDate = new Date(fromDate);
    previousFromDate.setDate(previousFromDate.getDate() - diffDays);
    
    const previousToDate = new Date(toDate);
    previousToDate.setDate(previousToDate.getDate() - diffDays);
    
    return {
      from: previousFromDate.toISOString().split('T')[0],
      to: previousToDate.toISOString().split('T')[0]
    };
  };

  const fetchTrendsData = async () => {
    setLoading(true);
    try {
      const previousPeriod = calculatePreviousPeriod();
      
      // Obtener datos para el período actual
      const currentResponse = await axios.get(`/api/orders/sales-statistics`, {
        params: {
          fromDate: dateRange.from,
          toDate: dateRange.to,
          groupBy: timeframe
        }
      });
      
      // Obtener datos para el período anterior
      const previousResponse = await axios.get(`/api/orders/sales-statistics`, {
        params: {
          fromDate: previousPeriod.from,
          toDate: previousPeriod.to,
          groupBy: timeframe
        }
      });
      
      // Guardar los datos brutos
      setTrendsData({
        currentPeriod: currentResponse.data.salesData,
        previousPeriod: previousResponse.data.salesData
      });
      
      // Preparar datos para comparación
      prepareComparisonData(currentResponse.data.salesData, previousResponse.data.salesData);
      
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar los datos de tendencias');
      console.error('Error fetching trends data:', error);
      setLoading(false);
    }
  };

  // Preparar datos para la comparación
  const prepareComparisonData = (currentData, previousData) => {
    // Obtener todas las etiquetas de período únicas
    const allLabels = [...new Set([
      ...currentData.map(item => item.period),
      ...previousData.map(item => item.period)
    ])];
    
    // Ordenar las etiquetas
    let sortedLabels = [...allLabels];
    if (timeframe === 'daily') {
      // Para etiquetas diarias, ordenar por fecha
      sortedLabels.sort((a, b) => new Date(a) - new Date(b));
    } else if (timeframe === 'monthly') {
      // Para etiquetas mensuales, ordenar por mes
      const monthOrder = {
        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
        'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
      };
      sortedLabels.sort((a, b) => monthOrder[a] - monthOrder[b]);
    } else if (timeframe === 'weekly') {
      // Para etiquetas semanales, ordenar por número de semana
      sortedLabels.sort((a, b) => {
        const weekNumA = parseInt(a.split(' ')[1]);
        const weekNumB = parseInt(b.split(' ')[1]);
        return weekNumA - weekNumB;
      });
    }
    
    // Preparar los arrays de datos para cada período
    const currentValues = [];
    const previousValues = [];
    
    // Función para obtener el valor correcto según la métrica seleccionada
    const getMetricValue = (item) => {
      if (metrics === 'sales') {
        return item ? item.amount : 0;
      } else if (metrics === 'orders') {
        return item ? item.orderCount : 0;
      } else if (metrics === 'average') {
        return item && item.orderCount > 0 ? item.amount / item.orderCount : 0;
      }
      return 0;
    };
    
    // Llenar los arrays con valores
    sortedLabels.forEach(label => {
      const currentItem = currentData.find(item => item.period === label);
      const previousItem = previousData.find(item => item.period === label);
      
      currentValues.push(getMetricValue(currentItem));
      previousValues.push(getMetricValue(previousItem));
    });
    
    // Preparar el objeto de comparación para el gráfico
    setComparisonData({
      labels: sortedLabels,
      current: currentValues,
      previous: previousValues
    });
    
    // Calcular resumen del período
    calculatePeriodSummary(currentValues, previousValues);
  };

  // Calcular resumen de comparación de períodos
  const calculatePeriodSummary = (currentValues, previousValues) => {
    const currentTotal = currentValues.reduce((sum, val) => sum + val, 0);
    const previousTotal = previousValues.reduce((sum, val) => sum + val, 0);
    
    let changePercentage = 0;
    let trend = 'neutral';
    
    if (previousTotal > 0) {
      changePercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
      trend = changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'neutral';
    } else if (currentTotal > 0) {
      changePercentage = 100;
      trend = 'up';
    }
    
    setPeriodSummary({
      currentTotal,
      previousTotal,
      changePercentage,
      trend
    });
  };

  // Datos para el gráfico
  const chartData = {
    labels: comparisonData.labels,
    datasets: [
      {
        label: 'Período Actual',
        data: comparisonData.current,
        borderColor: '#d94f70',
        backgroundColor: 'rgba(217, 79, 112, 0.5)',
        tension: 0.3,
        fill: chartType === 'area'
      },
      {
        label: 'Período Anterior',
        data: comparisonData.previous,
        borderColor: '#4fa1d9',
        backgroundColor: 'rgba(79, 161, 217, 0.5)',
        tension: 0.3,
        fill: chartType === 'area',
        borderDash: [5, 5]
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
        text: `Comparación de ${metrics === 'sales' ? 'Ventas' : metrics === 'orders' ? 'Órdenes' : 'Ticket Promedio'} ${
          timeframe === 'daily' ? 'Diarias' : timeframe === 'weekly' ? 'Semanales' : 'Mensuales'
        }`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (metrics === 'sales' || metrics === 'average') {
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
          text: metrics === 'sales' ? 'Monto de Ventas ($)' : 
                metrics === 'orders' ? 'Cantidad de Órdenes' : 
                'Ticket Promedio ($)'
        },
        ticks: {
          callback: function(value) {
            if (metrics === 'sales' || metrics === 'average') {
              return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
            }
            return value;
          }
        }
      }
    }
  };

  // Formatear valores según el tipo de métrica
  const formatValue = (value) => {
    if (metrics === 'sales' || metrics === 'average') {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
    }
    return value;
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (comparisonData.labels.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Período,${metrics === 'sales' ? 'Ventas' : metrics === 'orders' ? 'Órdenes' : 'Ticket Promedio'} (Actual),${metrics === 'sales' ? 'Ventas' : metrics === 'orders' ? 'Órdenes' : 'Ticket Promedio'} (Anterior),Diferencia,Diferencia (%)\n`;
    
    comparisonData.labels.forEach((label, index) => {
      const current = comparisonData.current[index];
      const previous = comparisonData.previous[index];
      const diff = current - previous;
      const diffPercentage = previous > 0 ? ((diff / previous) * 100).toFixed(2) : 'N/A';
      
      csvContent += `"${label}",${current},${previous},${diff},${diffPercentage}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comparacion_${metrics}_${timeframe}_${dateRange.from}_${dateRange.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Datos exportados correctamente');
  };

  return (
    <div className="trends-report">
      <div className="report-section-header">
        <h2>Tendencias y Comparaciones</h2>
        <p>Compara tus resultados actuales con períodos anteriores y analiza tendencias para tomar mejores decisiones.</p>
      </div>

      <div className="period-comparison-summary">
        <div className="current-period-info">
          <div className="period-label">Período Actual</div>
          <div className="period-dates">{dateRange.from} al {dateRange.to}</div>
        </div>
        
        <div className="previous-period-info">
          <div className="period-label">Período Anterior</div>
          <div className="period-dates">{calculatePreviousPeriod().from} al {calculatePreviousPeriod().to}</div>
        </div>
        
        <div className={`summary-trend ${periodSummary.trend}`}>
          <div className="trend-value">
            {periodSummary.trend === 'up' && <i className="fas fa-arrow-up"></i>}
            {periodSummary.trend === 'down' && <i className="fas fa-arrow-down"></i>}
            {periodSummary.trend === 'neutral' && <i className="fas fa-equals"></i>}
            {Math.abs(periodSummary.changePercentage).toFixed(2)}%
          </div>
          <div className="trend-label">
            {periodSummary.trend === 'up' ? 'Incremento' : 
             periodSummary.trend === 'down' ? 'Disminución' : 'Sin cambios'}
          </div>
        </div>
      </div>

      <div className="report-actions">
        <div className="metrics-selector">
          <button 
            className={`metrics-button ${metrics === 'sales' ? 'active' : ''}`}
            onClick={() => setMetrics('sales')}
          >
            Ventas
          </button>
          <button 
            className={`metrics-button ${metrics === 'orders' ? 'active' : ''}`}
            onClick={() => setMetrics('orders')}
          >
            Órdenes
          </button>
          <button 
            className={`metrics-button ${metrics === 'average' ? 'active' : ''}`}
            onClick={() => setMetrics('average')}
          >
            Ticket Promedio
          </button>
        </div>
        
        <div className="timeframe-selector">
          <button 
            className={`timeframe-button ${timeframe === 'daily' ? 'active' : ''}`}
            onClick={() => setTimeframe('daily')}
          >
            Diario
          </button>
          <button 
            className={`timeframe-button ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            Semanal
          </button>
          <button 
            className={`timeframe-button ${timeframe === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeframe('monthly')}
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

      <div className="trends-summary-cards">
        <div className="summary-card current-period">
          <div className="summary-card-title">Total {metrics === 'sales' ? 'Ventas' : metrics === 'orders' ? 'Órdenes' : 'Ticket Promedio'} (Actual)</div>
          <div className="summary-card-value">{formatValue(periodSummary.currentTotal)}</div>
        </div>
        <div className="summary-card previous-period">
          <div className="summary-card-title">Total {metrics === 'sales' ? 'Ventas' : metrics === 'orders' ? 'Órdenes' : 'Ticket Promedio'} (Anterior)</div>
          <div className="summary-card-value">{formatValue(periodSummary.previousTotal)}</div>
        </div>
        <div className="summary-card difference">
          <div className="summary-card-title">Diferencia</div>
          <div className="summary-card-value">
            {formatValue(periodSummary.currentTotal - periodSummary.previousTotal)}
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ height: '400px' }}>
        {loading ? (
          <div className="report-loading">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : comparisonData.labels.length > 0 ? (
          chartType === 'bar' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )
        ) : (
          <div className="no-data-message">
            <i className="fas fa-info-circle"></i>
            <p>No hay datos suficientes para la comparación en el período seleccionado</p>
          </div>
        )}
      </div>

      {!loading && comparisonData.labels.length > 0 && (
        <div className="trends-data-table-container">
          <h3>Detalle de Comparación</h3>
          <table className="report-data-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>{metrics === 'sales' ? 'Ventas' : metrics === 'orders' ? 'Órdenes' : 'Ticket Promedio'} (Actual)</th>
                <th>{metrics === 'sales' ? 'Ventas' : metrics === 'orders' ? 'Órdenes' : 'Ticket Promedio'} (Anterior)</th>
                <th>Diferencia</th>
                <th>Cambio (%)</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.labels.map((label, index) => {
                const current = comparisonData.current[index];
                const previous = comparisonData.previous[index];
                const diff = current - previous;
                const diffPercentage = previous > 0 ? ((diff / previous) * 100) : 0;
                
                return (
                  <tr key={index}>
                    <td>{label}</td>
                    <td>{formatValue(current)}</td>
                    <td>{formatValue(previous)}</td>
                    <td>{formatValue(diff)}</td>
                    <td>
                      <span className={`trend-percentage ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''}`}>
                        {diff > 0 && '+'}{diffPercentage.toFixed(2)}%
                        {diff > 0 && <i className="fas fa-arrow-up"></i>}
                        {diff < 0 && <i className="fas fa-arrow-down"></i>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td>Total</td>
                <td>{formatValue(periodSummary.currentTotal)}</td>
                <td>{formatValue(periodSummary.previousTotal)}</td>
                <td>{formatValue(periodSummary.currentTotal - periodSummary.previousTotal)}</td>
                <td>
                  <span className={`trend-percentage ${periodSummary.trend === 'up' ? 'positive' : periodSummary.trend === 'down' ? 'negative' : ''}`}>
                    {periodSummary.trend === 'up' && '+'}
                    {periodSummary.changePercentage.toFixed(2)}%
                    {periodSummary.trend === 'up' && <i className="fas fa-arrow-up"></i>}
                    {periodSummary.trend === 'down' && <i className="fas fa-arrow-down"></i>}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      
      <div className="insights-section">
        <h3>
          <i className="fas fa-lightbulb"></i>
          Insights y Recomendaciones
        </h3>
        
        {!loading && (
          <>
            {periodSummary.trend === 'up' && periodSummary.changePercentage > 20 && (
              <div className="insight-card positive">
                <div className="insight-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="insight-content">
                  <h4>Crecimiento Significativo</h4>
                  <p>Has logrado un crecimiento excepcional de {periodSummary.changePercentage.toFixed(2)}% en comparación con el período anterior. Analiza qué estrategias implementaste que pudieron contribuir a este aumento.</p>
                </div>
              </div>
            )}
            
            {periodSummary.trend === 'down' && periodSummary.changePercentage < -15 && (
              <div className="insight-card negative">
                <div className="insight-icon">
                  <i className="fas fa-arrow-down"></i>
                </div>
                <div className="insight-content">
                  <h4>Disminución Notable</h4>
                  <p>Se observa una caída de {Math.abs(periodSummary.changePercentage).toFixed(2)}% respecto al período anterior. Considera revisar factores externos o cambios recientes que puedan haber afectado tus resultados.</p>
                </div>
              </div>
            )}
            
            {metrics === 'average' && periodSummary.currentTotal > periodSummary.previousTotal && (
              <div className="insight-card neutral">
                <div className="insight-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="insight-content">
                  <h4>Aumento en Ticket Promedio</h4>
                  <p>El valor promedio por orden ha incrementado. Esto puede indicar que tus clientes están comprando productos de mayor valor o aumentando la cantidad de items por orden.</p>
                </div>
              </div>
            )}
            
            {metrics === 'sales' && periodSummary.trend === 'up' && comparisonData.current.some((val, idx) => val > comparisonData.previous[idx] * 1.5) && (
              <div className="insight-card positive">
                <div className="insight-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div className="insight-content">
                  <h4>Picos de Ventas Notables</h4>
                  <p>Se detectaron picos de ventas significativos en algunos períodos. Identifica qué promociones o eventos coincidieron con estos incrementos para replicar su éxito.</p>
                </div>
              </div>
            )}
            
            {metrics === 'orders' && periodSummary.trend === 'down' && (
              <div className="insight-card neutral">
                <div className="insight-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="insight-content">
                  <h4>Disminución en Número de Órdenes</h4>
                  <p>La cantidad de órdenes ha disminuido. Considera implementar promociones o estrategias de marketing para atraer más clientes y aumentar la frecuencia de compra.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrendsReportComponent;
