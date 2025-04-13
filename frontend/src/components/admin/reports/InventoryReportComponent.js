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

const InventoryReportComponent = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'out', 'excess'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'stock', 'sold'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Stocks thresholds for filtering
  const LOW_STOCK_THRESHOLD = 5;
  const EXCESS_STOCK_THRESHOLD = 50;

  useEffect(() => {
    fetchInventoryData();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterInventoryData();
  }, [inventoryData, filter, categoryFilter, searchTerm, sortBy, sortOrder]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products/inventory');
      setInventoryData(response.data.products);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar los datos de inventario');
      console.error('Error fetching inventory data:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterInventoryData = () => {
    let filtered = [...inventoryData];
    
    // Aplicar filtro de stock
    if (filter === 'low') {
      filtered = filtered.filter(item => item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD);
    } else if (filter === 'out') {
      filtered = filtered.filter(item => item.stock === 0);
    } else if (filter === 'excess') {
      filtered = filtered.filter(item => item.stock >= EXCESS_STOCK_THRESHOLD);
    }
    
    // Aplicar filtro de categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Aplicar búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term))
      );
    }
    
    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'stock') {
        comparison = a.stock - b.stock;
      } else if (sortBy === 'sold') {
        comparison = (a.totalSold || 0) - (b.totalSold || 0);
      } else if (sortBy === 'value') {
        comparison = (a.stock * a.price) - (b.stock * b.price);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredData(filtered);
  };

  // Datos para el gráfico de inventario
  const getChartData = () => {
    // Tomar los 10 productos con mayor valor de inventario
    const topItems = [...filteredData]
      .sort((a, b) => (b.stock * b.price) - (a.stock * a.price))
      .slice(0, 10);
    
    return {
      labels: topItems.map(item => item.name),
      datasets: [
        {
          label: 'Valor de Inventario',
          data: topItems.map(item => item.stock * item.price),
          backgroundColor: 'rgba(217, 79, 112, 0.7)',
          borderColor: '#d94f70',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Cantidad en Stock',
          data: topItems.map(item => item.stock),
          backgroundColor: 'rgba(79, 161, 217, 0.7)',
          borderColor: '#4fa1d9',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };
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
        text: 'Top 10 Productos por Valor de Inventario'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Valor de Inventario ($)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Cantidad en Stock'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  // Calcular estadísticas de inventario
  const calculateInventoryStats = () => {
    const totalProducts = inventoryData.length;
    const totalInStock = inventoryData.filter(item => item.stock > 0).length;
    const lowStockCount = inventoryData.filter(item => item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD).length;
    const outOfStockCount = inventoryData.filter(item => item.stock === 0).length;
    const excessStockCount = inventoryData.filter(item => item.stock >= EXCESS_STOCK_THRESHOLD).length;
    
    const totalStockValue = inventoryData.reduce((sum, item) => sum + (item.stock * item.price), 0);
    const lowStockValue = inventoryData
      .filter(item => item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD)
      .reduce((sum, item) => sum + (item.stock * item.price), 0);
    
    return {
      totalProducts,
      totalInStock,
      lowStockCount,
      outOfStockCount,
      excessStockCount,
      totalStockValue,
      lowStockValue
    };
  };

  const stats = calculateInventoryStats();

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Producto,Categoría,Stock Actual,Valor Unitario,Valor Total,Ventas Totales\n";
    
    filteredData.forEach(item => {
      csvContent += `"${item.name}","${item.category || 'Sin categoría'}",${item.stock},${item.price},${item.stock * item.price},${item.totalSold || 0}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Datos exportados correctamente');
  };

  return (
    <div className="inventory-report">
      <div className="report-section-header">
        <h2>Inventario y Stock</h2>
        <p>Monitorea los niveles de inventario, productos con bajo stock y valor total del inventario.</p>
      </div>

      <div className="inventory-summary-cards">
        <div className="summary-card">
          <div className="summary-card-title">Productos Totales</div>
          <div className="summary-card-value">{stats.totalProducts}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">Con Stock</div>
          <div className="summary-card-value">{stats.totalInStock}</div>
        </div>
        <div className="summary-card red-alert">
          <div className="summary-card-title">Sin Stock</div>
          <div className="summary-card-value">{stats.outOfStockCount}</div>
        </div>
        <div className="summary-card yellow-alert">
          <div className="summary-card-title">Stock Bajo</div>
          <div className="summary-card-value">{stats.lowStockCount}</div>
        </div>
        <div className="summary-card blue-alert">
          <div className="summary-card-title">Stock Excesivo</div>
          <div className="summary-card-value">{stats.excessStockCount}</div>
        </div>
        <div className="summary-card total-value">
          <div className="summary-card-title">Valor Total del Inventario</div>
          <div className="summary-card-value">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats.totalStockValue)}
          </div>
        </div>
      </div>

      <div className="inventory-controls">
        <div className="inventory-filters">
          <div className="filter-group">
            <label>Filtrar por estado:</label>
            <div className="button-filter-group">
              <button 
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todos
              </button>
              <button 
                className={`filter-button ${filter === 'low' ? 'active' : ''}`}
                onClick={() => setFilter('low')}
              >
                Stock Bajo
              </button>
              <button 
                className={`filter-button ${filter === 'out' ? 'active' : ''}`}
                onClick={() => setFilter('out')}
              >
                Sin Stock
              </button>
              <button 
                className={`filter-button ${filter === 'excess' ? 'active' : ''}`}
                onClick={() => setFilter('excess')}
              >
                Stock Excesivo
              </button>
            </div>
          </div>
          
          <div className="filter-group">
            <label>Categoría:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-filter"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Buscar:</label>
            <div className="search-input">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
              />
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>
        
        <div className="inventory-actions">
          <button className="refresh-button" onClick={fetchInventoryData}>
            <i className="fas fa-sync-alt"></i>
            Actualizar
          </button>
          
          <button className="export-button" onClick={exportToCSV}>
            <i className="fas fa-file-export"></i>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="chart-container" style={{ height: '400px' }}>
        {loading ? (
          <div className="report-loading">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <Bar data={getChartData()} options={chartOptions} />
        ) : (
          <div className="no-data-message">
            <i className="fas fa-info-circle"></i>
            <p>No se encontraron productos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      <div className="inventory-table-header">
        <h3>Detalle de Inventario</h3>
        <div className="inventory-sort-controls">
          <label>Ordenar por:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Nombre</option>
            <option value="stock">Stock</option>
            <option value="sold">Unidades Vendidas</option>
            <option value="value">Valor de Inventario</option>
          </select>
          
          <button 
            className="sort-order-button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {!loading && (
        <div className="inventory-table-container">
          <table className="report-data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Estado</th>
                <th>Precio Unitario</th>
                <th>Valor Total</th>
                <th>Ventas Totales</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                let stockStatus = 'normal';
                let statusLabel = 'Normal';
                
                if (item.stock === 0) {
                  stockStatus = 'out-of-stock';
                  statusLabel = 'Sin Stock';
                } else if (item.stock <= LOW_STOCK_THRESHOLD) {
                  stockStatus = 'low-stock';
                  statusLabel = 'Stock Bajo';
                } else if (item.stock >= EXCESS_STOCK_THRESHOLD) {
                  stockStatus = 'excess-stock';
                  statusLabel = 'Stock Excesivo';
                }
                
                return (
                  <tr key={index}>
                    <td>
                      <div className="product-name-cell">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="product-thumbnail" 
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>{item.category || 'Sin categoría'}</td>
                    <td>{item.stock}</td>
                    <td>
                      <span className={`stock-status ${stockStatus}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.price)}</td>
                    <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.stock * item.price)}</td>
                    <td>{item.totalSold || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="no-data-message table-message">
              <p>No se encontraron productos con los filtros seleccionados</p>
            </div>
          )}
          
          <div className="table-footer">
            <p>Mostrando {filteredData.length} de {inventoryData.length} productos</p>
          </div>
        </div>
      )}
      
      <div className="report-section inventory-alert-section">
        <h3>Alertas de Inventario</h3>
        <p>Estos productos requieren atención inmediata</p>
        
        <div className="inventory-alerts">
          {!loading && stats.outOfStockCount > 0 && (
            <div className="alert-group">
              <h4>
                <i className="fas fa-exclamation-circle"></i>
                Productos Sin Stock ({stats.outOfStockCount})
              </h4>
              <div className="alert-products">
                {inventoryData
                  .filter(item => item.stock === 0)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="alert-product">
                      <div className="alert-product-name">{item.name}</div>
                      <div className="alert-product-category">{item.category || 'Sin categoría'}</div>
                    </div>
                  ))}
                {stats.outOfStockCount > 5 && (
                  <div className="view-more">
                    <button onClick={() => { setFilter('out'); setSearchTerm(''); setCategoryFilter('all'); }}>
                      Ver todos ({stats.outOfStockCount})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!loading && stats.lowStockCount > 0 && (
            <div className="alert-group">
              <h4>
                <i className="fas fa-exclamation-triangle"></i>
                Productos con Stock Bajo ({stats.lowStockCount})
              </h4>
              <div className="alert-products">
                {inventoryData
                  .filter(item => item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="alert-product">
                      <div className="alert-product-name">{item.name}</div>
                      <div className="alert-product-stock">Stock: {item.stock}</div>
                    </div>
                  ))}
                {stats.lowStockCount > 5 && (
                  <div className="view-more">
                    <button onClick={() => { setFilter('low'); setSearchTerm(''); setCategoryFilter('all'); }}>
                      Ver todos ({stats.lowStockCount})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReportComponent;
