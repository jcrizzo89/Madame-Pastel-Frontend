const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Obtiene un resumen para el dashboard con estadísticas principales
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    // Fecha actual
    const now = new Date();
    
    // Primer día del mes actual
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Primer día del mes anterior
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Primer día del próximo mes (para límites de búsqueda)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Inicio del día actual
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Inicio del día siguiente
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Estadísticas del mes actual
    const currentMonthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth, $lt: nextMonth },
          status: { $nin: ["cancelled"] },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: null,
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Estadísticas del mes anterior
    const lastMonthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $lt: currentMonth },
          status: { $nin: ["cancelled"] },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: null,
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Estadísticas del día actual
    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $nin: ["cancelled"] }
        }
      },
      {
        $group: {
          _id: null,
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Productos más vendidos del mes
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth, $lt: nextMonth },
          status: { $nin: ["cancelled"] },
          paymentStatus: "paid"
        }
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          name: { $first: "$products.name" },
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
          image: { $first: "$products.image" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Pedidos pendientes
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending", "processing"] }
    });

    // Productos con stock bajo
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 }
    });

    // Calcular cambios porcentuales
    const currentMonthSales = currentMonthStats.length > 0 ? currentMonthStats[0].sales : 0;
    const currentMonthOrders = currentMonthStats.length > 0 ? currentMonthStats[0].orders : 0;
    const lastMonthSales = lastMonthStats.length > 0 ? lastMonthStats[0].sales : 0;
    const lastMonthOrders = lastMonthStats.length > 0 ? lastMonthStats[0].orders : 0;

    const percentChange = {
      sales: lastMonthSales === 0 ? 0 : ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100,
      orders: lastMonthOrders === 0 ? 0 : ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
    };

    // Devolver los datos
    res.json({
      currentMonth: {
        sales: currentMonthSales,
        orders: currentMonthOrders
      },
      lastMonth: {
        sales: lastMonthSales,
        orders: lastMonthOrders
      },
      today: {
        sales: todayStats.length > 0 ? todayStats[0].sales : 0,
        orders: todayStats.length > 0 ? todayStats[0].orders : 0
      },
      percentChange,
      pendingOrders,
      lowStockProducts,
      topProducts
    });
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({ message: 'Error al obtener resumen del dashboard' });
  }
};

/**
 * Obtener actividad reciente
 */
exports.getRecentActivity = async (req, res) => {
  try {
    // Obtener los pedidos más recientes
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id customerName totalAmount createdAt status paymentStatus')
      .lean();

    // Obtener productos con stock bajo recientemente actualizados
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('_id name stock price updatedAt')
      .lean();

    // Mapear los resultados para tener un formato homogéneo
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        id: order._id,
        title: 'Nuevo pedido recibido',
        subtitle: `Pedido #${order._id.toString().substring(0, 6)} - $${order.totalAmount.toFixed(2)}`,
        time: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus
      })),
      ...lowStockProducts.map(product => ({
        type: 'product',
        id: product._id,
        title: 'Producto con stock bajo',
        subtitle: `${product.name} - ${product.stock} unidades restantes`,
        time: product.updatedAt
      }))
    ];

    // Ordenar por fecha más reciente
    activities.sort((a, b) => b.time - a.time);

    res.json(activities.slice(0, 6)); // Limitar a 6 actividades
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({ message: 'Error al obtener actividad reciente' });
  }
};

/**
 * Obtener tendencias de ventas de los últimos meses
 */
exports.getSalesTrends = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    // Ventas mensuales de los últimos 6 meses
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $nin: ["cancelled"] },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Formatear los resultados para Chart.js
    const labels = [];
    const salesData = [];
    const ordersData = [];

    // Completar los últimos 6 meses
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthYear = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      // Crear etiqueta con nombre del mes
      const monthName = month.toLocaleString('es-AR', { month: 'long' });
      labels.push(monthName);
      
      // Buscar datos para este mes
      const monthData = monthlySales.find(
        item => item._id.year === monthYear && item._id.month === monthNum
      );
      
      // Agregar datos o ceros si no hay datos
      salesData.push(monthData ? monthData.sales : 0);
      ordersData.push(monthData ? monthData.orders : 0);
    }

    res.json({
      labels,
      datasets: [
        {
          label: 'Ventas',
          data: salesData
        },
        {
          label: 'Pedidos',
          data: ordersData
        }
      ]
    });
  } catch (error) {
    console.error('Error al obtener tendencias de ventas:', error);
    res.status(500).json({ message: 'Error al obtener tendencias de ventas' });
  }
};

/**
 * Obtener distribución de ventas por categoría para el mes actual
 */
exports.getCurrentCategorySales = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Ventas por categoría del mes actual
    const categorySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth, $lt: nextMonth },
          status: { $nin: ["cancelled"] },
          paymentStatus: "paid"
        }
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.category",
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.json(categorySales);
  } catch (error) {
    console.error('Error al obtener ventas por categoría del mes actual:', error);
    res.status(500).json({ message: 'Error al obtener ventas por categoría' });
  }
};
