const Statistic = require('../models/Statistic');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Obtener todas las estadísticas
exports.getStatistics = async (req, res) => {
  try {
    let stats = await Statistic.findOne()
      .populate('productViews.productId', 'name image category')
      .populate('productPurchases.productId', 'name image category');
    
    // Si no hay estadísticas, crear un documento inicial
    if (!stats) {
      stats = new Statistic();
      await stats.save();
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registrar visita a página
exports.recordPageVisit = async (req, res) => {
  try {
    const { page } = req.body;
    
    if (!page) {
      return res.status(400).json({ message: 'Se requiere el nombre de la página' });
    }
    
    let stats = await Statistic.findOne();
    
    // Si no hay estadísticas, crear un documento inicial
    if (!stats) {
      stats = new Statistic();
    }
    
    // Incrementar el contador correspondiente
    if (stats.pageVisits[page] !== undefined) {
      stats.pageVisits[page] += 1;
    } else {
      stats.pageVisits.other += 1;
    }
    
    stats.lastUpdated = Date.now();
    await stats.save();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al registrar visita:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registrar vista de producto
exports.recordProductView = async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Se requiere el ID del producto' });
    }
    
    let stats = await Statistic.findOne();
    
    // Si no hay estadísticas, crear un documento inicial
    if (!stats) {
      stats = new Statistic();
    }
    
    // Buscar si ya existe una entrada para este producto
    const productViewIndex = stats.productViews.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (productViewIndex > -1) {
      // Incrementar contador si ya existe
      stats.productViews[productViewIndex].count += 1;
    } else {
      // Agregar nuevo registro si no existe
      stats.productViews.push({
        productId,
        count: 1
      });
    }
    
    stats.lastUpdated = Date.now();
    await stats.save();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al registrar vista de producto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registrar compra de producto (llamado después de una venta exitosa)
exports.recordPurchase = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Se requiere el ID de la orden' });
    }
    
    // Obtener detalles de la orden
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    let stats = await Statistic.findOne();
    
    // Si no hay estadísticas, crear un documento inicial
    if (!stats) {
      stats = new Statistic();
    }
    
    // Registrar cada producto comprado
    for (const item of order.items) {
      const productId = item.product._id.toString();
      const quantity = item.quantity;
      const revenue = item.price * quantity;
      
      // Buscar si ya existe una entrada para este producto
      const productPurchaseIndex = stats.productPurchases.findIndex(
        p => p.productId.toString() === productId
      );
      
      if (productPurchaseIndex > -1) {
        // Incrementar contador si ya existe
        stats.productPurchases[productPurchaseIndex].count += quantity;
        stats.productPurchases[productPurchaseIndex].revenue += revenue;
      } else {
        // Agregar nuevo registro si no existe
        stats.productPurchases.push({
          productId,
          count: quantity,
          revenue
        });
      }
    }
    
    // Actualizar ventas diarias
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailySaleIndex = stats.dailySales.findIndex(
      sale => new Date(sale.date).setHours(0, 0, 0, 0) === today.getTime()
    );
    
    if (dailySaleIndex > -1) {
      // Actualizar registro para hoy
      stats.dailySales[dailySaleIndex].count += 1;
      stats.dailySales[dailySaleIndex].revenue += order.total;
    } else {
      // Crear nuevo registro para hoy
      stats.dailySales.push({
        date: today,
        count: 1,
        revenue: order.total
      });
    }
    
    stats.lastUpdated = Date.now();
    await stats.save();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al registrar compra:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener los productos más vistos
exports.getMostViewedProducts = async (req, res) => {
  try {
    const stats = await Statistic.findOne()
      .populate('productViews.productId', 'name image category price');
    
    if (!stats) {
      return res.status(404).json({ message: 'No hay estadísticas disponibles' });
    }
    
    // Ordenar por número de vistas (descendente)
    const sortedProducts = [...stats.productViews].sort((a, b) => b.count - a.count);
    
    res.json(sortedProducts.slice(0, 10)); // Devolver los 10 más vistos
  } catch (error) {
    console.error('Error al obtener productos más vistos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener los productos más vendidos
exports.getMostSoldProducts = async (req, res) => {
  try {
    const stats = await Statistic.findOne()
      .populate('productPurchases.productId', 'name image category price');
    
    if (!stats) {
      return res.status(404).json({ message: 'No hay estadísticas disponibles' });
    }
    
    // Ordenar por número de ventas (descendente)
    const sortedProducts = [...stats.productPurchases].sort((a, b) => b.count - a.count);
    
    res.json(sortedProducts.slice(0, 10)); // Devolver los 10 más vendidos
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener resumen de estadísticas para dashboard
exports.getStatisticsSummary = async (req, res) => {
  try {
    const stats = await Statistic.findOne();
    
    if (!stats) {
      return res.status(404).json({ message: 'No hay estadísticas disponibles' });
    }
    
    // Calcular total de visitas
    const totalVisits = Object.values(stats.pageVisits).reduce((sum, count) => sum + count, 0);
    
    // Calcular total de ventas
    const totalSales = stats.dailySales.reduce((sum, day) => sum + day.count, 0);
    
    // Calcular ingresos totales
    const totalRevenue = stats.dailySales.reduce((sum, day) => sum + day.revenue, 0);
    
    // Obtener ventas de los últimos 7 días
    const lastWeekSales = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const sale = stats.dailySales.find(
        s => new Date(s.date).setHours(0, 0, 0, 0) === date.getTime()
      );
      
      lastWeekSales.push({
        date: date.toISOString().split('T')[0],
        count: sale ? sale.count : 0,
        revenue: sale ? sale.revenue : 0
      });
    }
    
    res.json({
      totalVisits,
      totalSales,
      totalRevenue,
      lastWeekSales,
      pageVisitsSummary: stats.pageVisits
    });
  } catch (error) {
    console.error('Error al obtener resumen de estadísticas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar datos demográficos (dispositivo)
exports.recordDeviceType = async (req, res) => {
  try {
    const { deviceType } = req.body;
    
    if (!deviceType || !['mobile', 'desktop', 'tablet'].includes(deviceType)) {
      return res.status(400).json({ message: 'Tipo de dispositivo inválido' });
    }
    
    let stats = await Statistic.findOne();
    
    // Si no hay estadísticas, crear un documento inicial
    if (!stats) {
      stats = new Statistic();
    }
    
    // Incrementar el contador correspondiente
    stats.demographics.devices[deviceType] += 1;
    
    stats.lastUpdated = Date.now();
    await stats.save();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al registrar tipo de dispositivo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
