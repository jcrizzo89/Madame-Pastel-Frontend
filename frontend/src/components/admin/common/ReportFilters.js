import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { formatDate } from '../../../utils/exportUtils';
import '../../../styles/admin/ReportFilters.css';

/**
 * Componente para filtrar datos en reportes
 */
const ReportFilters = ({ 
  onFilterChange, 
  initialFilters = {}, 
  filterOptions = {
    dateRange: true,
    category: false,
    status: false,
    paymentStatus: false,
    minAmount: false,
    search: false
  }
}) => {
  // Estados para cada tipo de filtro
  const [startDate, setStartDate] = useState(initialFilters.startDate || null);
  const [endDate, setEndDate] = useState(initialFilters.endDate || null);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedStatus, setSelectedStatus] = useState(initialFilters.status || '');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(initialFilters.paymentStatus || '');
  const [minAmount, setMinAmount] = useState(initialFilters.minAmount || '');
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [categories, setCategories] = useState([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Opciones de estados de pedido
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'En proceso' },
    { value: 'completed', label: 'Completado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  // Opciones de estados de pago
  const paymentStatusOptions = [
    { value: '', label: 'Todos los pagos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'failed', label: 'Fallido' },
    { value: 'refunded', label: 'Reembolsado' }
  ];

  // Cargar categorías si se necesitan
  useEffect(() => {
    if (filterOptions.category) {
      const fetchCategories = async () => {
        try {
          const { data } = await axios.get('/api/categories');
          setCategories([{ _id: '', name: 'Todas las categorías' }, ...data]);
        } catch (error) {
          console.error('Error al cargar categorías:', error);
        }
      };
      
      fetchCategories();
    }
  }, [filterOptions.category]);

  // Opciones de periodos predefinidos
  const predefinedPeriods = [
    { label: 'Hoy', handler: () => {
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
    }},
    { label: 'Ayer', handler: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setStartDate(yesterday);
      setEndDate(yesterday);
    }},
    { label: 'Esta semana', handler: () => {
      const today = new Date();
      const firstDay = new Date(today);
      const day = today.getDay() || 7;
      firstDay.setDate(today.getDate() - day + 1);
      setStartDate(firstDay);
      setEndDate(today);
    }},
    { label: 'Este mes', handler: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay);
      setEndDate(today);
    }},
    { label: 'Último mes', handler: () => {
      const today = new Date();
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      setStartDate(firstDayLastMonth);
      setEndDate(lastDayLastMonth);
    }},
    { label: 'Este año', handler: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), 0, 1);
      setStartDate(firstDay);
      setEndDate(today);
    }}
  ];

  // Aplicar filtros cuando cambien
  useEffect(() => {
    const filters = {};
    
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedStatus) filters.status = selectedStatus;
    if (selectedPaymentStatus) filters.paymentStatus = selectedPaymentStatus;
    if (minAmount) filters.minAmount = parseFloat(minAmount);
    if (searchTerm) filters.search = searchTerm;
    
    onFilterChange(filters);
  }, [startDate, endDate, selectedCategory, selectedStatus, selectedPaymentStatus, minAmount, searchTerm, onFilterChange]);

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPaymentStatus('');
    setMinAmount('');
    setSearchTerm('');
  };

  return (
    <div className="report-filters">
      <div className="filters-row">
        {filterOptions.dateRange && (
          <div className="filter-group date-filter">
            <label>Periodo</label>
            <div className="date-inputs">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Fecha inicio"
                isClearable
                className="date-picker"
              />
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Fecha fin"
                isClearable
                className="date-picker"
              />
            </div>
          </div>
        )}

        {filterOptions.search && (
          <div className="filter-group search-filter">
            <label>Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="search-input"
            />
          </div>
        )}

        {filterOptions.category && (
          <div className="filter-group">
            <label>Categoría</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-actions">
          <button 
            className="advanced-filters-toggle" 
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            {isAdvancedOpen ? 'Ocultar filtros' : 'Más filtros'}
            <i className={`fas fa-chevron-${isAdvancedOpen ? 'up' : 'down'}`}></i>
          </button>
          
          <button 
            className="clear-filters-button" 
            onClick={handleClearFilters}
          >
            <i className="fas fa-times"></i>
            Limpiar
          </button>
        </div>
      </div>

      {filterOptions.dateRange && (
        <div className="predefined-periods">
          {predefinedPeriods.map((period, index) => (
            <button 
              key={index} 
              className="period-button"
              onClick={period.handler}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}

      {isAdvancedOpen && (
        <div className="advanced-filters">
          <div className="filters-row">
            {filterOptions.status && (
              <div className="filter-group">
                <label>Estado del pedido</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.paymentStatus && (
              <div className="filter-group">
                <label>Estado de pago</label>
                <select
                  value={selectedPaymentStatus}
                  onChange={e => setSelectedPaymentStatus(e.target.value)}
                  className="filter-select"
                >
                  {paymentStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.minAmount && (
              <div className="filter-group">
                <label>Monto mínimo</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  placeholder="Monto mínimo"
                  className="amount-input"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {(startDate || endDate || selectedCategory || selectedStatus || selectedPaymentStatus || minAmount || searchTerm) && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros activos:</span>
          {startDate && endDate && (
            <div className="active-filter">
              <span>Periodo: {formatDate(startDate)} - {formatDate(endDate)}</span>
              <button onClick={() => { setStartDate(null); setEndDate(null); }}>
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          )}
          
          {selectedCategory && (
            <div className="active-filter">
              <span>Categoría: {categories.find(c => c._id === selectedCategory)?.name || selectedCategory}</span>
              <button onClick={() => setSelectedCategory('')}>
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          )}
          
          {selectedStatus && (
            <div className="active-filter">
              <span>Estado: {statusOptions.find(s => s.value === selectedStatus)?.label}</span>
              <button onClick={() => setSelectedStatus('')}>
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          )}
          
          {selectedPaymentStatus && (
            <div className="active-filter">
              <span>Pago: {paymentStatusOptions.find(s => s.value === selectedPaymentStatus)?.label}</span>
              <button onClick={() => setSelectedPaymentStatus('')}>
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          )}
          
          {minAmount && (
            <div className="active-filter">
              <span>Monto mínimo: ${minAmount}</span>
              <button onClick={() => setMinAmount('')}>
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          )}
          
          {searchTerm && (
            <div className="active-filter">
              <span>Búsqueda: "{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')}>
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
