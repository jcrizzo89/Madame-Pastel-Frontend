const axios = require('axios');
const colors = require('colors');

// Configuración
const API_URL = 'http://localhost:5000/api';
const TOKEN = process.env.ADMIN_TOKEN || '';

// Headers para autenticación
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

// Fechas para pruebas
const today = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);

const fromDate = oneMonthAgo.toISOString().split('T')[0];
const toDate = today.toISOString().split('T')[0];

// Funciones auxiliares
const logSuccess = (message) => console.log(colors.green(`✓ ${message}`));
const logError = (message) => console.log(colors.red(`✗ ${message}`));
const logInfo = (message) => console.log(colors.blue(`ℹ ${message}`));

// Función para medir el tiempo de respuesta
const measureResponseTime = async (endpoint, params = {}) => {
  const start = Date.now();
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, { 
      headers,
      params
    });
    const time = Date.now() - start;
    return { 
      success: true, 
      time,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    const time = Date.now() - start;
    return { 
      success: false, 
      time,
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 500
    };
  }
};

// Función para validar la estructura de datos
const validateDataStructure = (data, expectedKeys) => {
  const missingKeys = expectedKeys.filter(key => !data.hasOwnProperty(key));
  return { 
    valid: missingKeys.length === 0,
    missingKeys
  };
};

// Pruebas de endpoints
const testEndpoints = async () => {
  logInfo('Iniciando pruebas de endpoints de reportes...');
  
  // 1. Prueba: Estadísticas de ventas por período
  logInfo('\nProbando endpoint: GET /orders/sales-statistics');
  
  const salesStatsResult = await measureResponseTime('/orders/sales-statistics', {
    fromDate,
    toDate,
    groupBy: 'daily'
  });
  
  if (salesStatsResult.success) {
    logSuccess(`Endpoint respondió en ${salesStatsResult.time}ms con estado ${salesStatsResult.status}`);
    
    // Validar estructura de datos
    const { valid, missingKeys } = validateDataStructure(salesStatsResult.data, ['salesData']);
    
    if (valid) {
      logSuccess('Estructura de datos correcta');
      
      // Analizar datos específicos
      const { salesData } = salesStatsResult.data;
      logInfo(`Recibidos ${salesData.length} períodos de datos`);
      
      if (salesData.length > 0) {
        const firstPeriod = salesData[0];
        const periodValidation = validateDataStructure(firstPeriod, ['period', 'amount', 'orderCount']);
        
        if (periodValidation.valid) {
          logSuccess('Estructura de datos de período correcta');
        } else {
          logError(`Estructura de datos de período inválida. Faltan propiedades: ${periodValidation.missingKeys.join(', ')}`);
        }
      }
      
      // Verificar si hay datos faltantes
      const emptyPeriods = salesData.filter(period => period.amount === 0 && period.orderCount === 0).length;
      logInfo(`Períodos sin ventas: ${emptyPeriods} de ${salesData.length}`);
    } else {
      logError(`Estructura de datos inválida. Faltan propiedades: ${missingKeys.join(', ')}`);
    }
  } else {
    logError(`Error en la solicitud: ${salesStatsResult.status} - ${JSON.stringify(salesStatsResult.error)}`);
  }
  
  // 2. Prueba: Productos más vendidos
  logInfo('\nProbando endpoint: GET /orders/most-sold-products');
  
  const mostSoldResult = await measureResponseTime('/orders/most-sold-products', {
    fromDate,
    toDate,
    limit: 10,
    sortBy: 'quantity'
  });
  
  if (mostSoldResult.success) {
    logSuccess(`Endpoint respondió en ${mostSoldResult.time}ms con estado ${mostSoldResult.status}`);
    
    // Validar estructura de datos
    const { valid, missingKeys } = validateDataStructure(mostSoldResult.data, ['products']);
    
    if (valid) {
      logSuccess('Estructura de datos correcta');
      
      // Analizar datos específicos
      const { products } = mostSoldResult.data;
      logInfo(`Recibidos ${products.length} productos`);
      
      if (products.length > 0) {
        const firstProduct = products[0];
        const productValidation = validateDataStructure(firstProduct, ['_id', 'name', 'quantity', 'revenue']);
        
        if (productValidation.valid) {
          logSuccess('Estructura de datos de producto correcta');
        } else {
          logError(`Estructura de datos de producto inválida. Faltan propiedades: ${productValidation.missingKeys.join(', ')}`);
        }
      }
    } else {
      logError(`Estructura de datos inválida. Faltan propiedades: ${missingKeys.join(', ')}`);
    }
  } else {
    logError(`Error en la solicitud: ${mostSoldResult.status} - ${JSON.stringify(mostSoldResult.error)}`);
  }
  
  // 3. Prueba: Ventas por categoría
  logInfo('\nProbando endpoint: GET /orders/sales-by-category');
  
  const categoryResult = await measureResponseTime('/orders/sales-by-category', {
    fromDate,
    toDate,
    sortBy: 'revenue'
  });
  
  if (categoryResult.success) {
    logSuccess(`Endpoint respondió en ${categoryResult.time}ms con estado ${categoryResult.status}`);
    
    // Validar estructura de datos
    const { valid, missingKeys } = validateDataStructure(categoryResult.data, ['categories']);
    
    if (valid) {
      logSuccess('Estructura de datos correcta');
      
      // Analizar datos específicos
      const { categories } = categoryResult.data;
      logInfo(`Recibidas ${categories.length} categorías`);
      
      if (categories.length > 0) {
        const firstCategory = categories[0];
        const categoryValidation = validateDataStructure(firstCategory, ['name', 'totalQuantity', 'totalRevenue']);
        
        if (categoryValidation.valid) {
          logSuccess('Estructura de datos de categoría correcta');
        } else {
          logError(`Estructura de datos de categoría inválida. Faltan propiedades: ${categoryValidation.missingKeys.join(', ')}`);
        }
      }
    } else {
      logError(`Estructura de datos inválida. Faltan propiedades: ${missingKeys.join(', ')}`);
    }
  } else {
    logError(`Error en la solicitud: ${categoryResult.status} - ${JSON.stringify(categoryResult.error)}`);
  }
  
  // 4. Prueba: Resumen del dashboard
  logInfo('\nProbando endpoint: GET /orders/dashboard-summary');
  
  const dashboardResult = await measureResponseTime('/orders/dashboard-summary');
  
  if (dashboardResult.success) {
    logSuccess(`Endpoint respondió en ${dashboardResult.time}ms con estado ${dashboardResult.status}`);
    
    // Validar estructura de datos
    const expectedKeys = [
      'currentMonth', 
      'lastMonth', 
      'today', 
      'pendingOrders', 
      'lowStockProducts', 
      'topProducts',
      'percentChange'
    ];
    
    const { valid, missingKeys } = validateDataStructure(dashboardResult.data, expectedKeys);
    
    if (valid) {
      logSuccess('Estructura de datos correcta');
      
      // Verificar estructura de datos anidados
      const currentMonthValidation = validateDataStructure(dashboardResult.data.currentMonth, ['sales', 'orders']);
      if (!currentMonthValidation.valid) {
        logError(`Estructura de datos 'currentMonth' inválida. Faltan propiedades: ${currentMonthValidation.missingKeys.join(', ')}`);
      }
      
      const percentChangeValidation = validateDataStructure(dashboardResult.data.percentChange, ['sales', 'orders']);
      if (!percentChangeValidation.valid) {
        logError(`Estructura de datos 'percentChange' inválida. Faltan propiedades: ${percentChangeValidation.missingKeys.join(', ')}`);
      }
    } else {
      logError(`Estructura de datos inválida. Faltan propiedades: ${missingKeys.join(', ')}`);
    }
  } else {
    logError(`Error en la solicitud: ${dashboardResult.status} - ${JSON.stringify(dashboardResult.error)}`);
  }
  
  logInfo('\nPruebas completadas.');
};

// Ejecutar las pruebas
testEndpoints().catch(error => {
  console.error('Error al ejecutar las pruebas:', error);
});
