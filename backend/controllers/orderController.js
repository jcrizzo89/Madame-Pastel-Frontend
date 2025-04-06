const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Obtener todos los pedidos
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

// Obtener un pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
  }
};

// Crear un nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Calcular el monto total si no se proporciona
    if (!orderData.totalAmount) {
      orderData.totalAmount = orderData.products.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
    }
    
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    
    // Actualizar el inventario
    for (const item of orderData.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Actualizar stock del producto
        product.stock -= item.quantity;
        await product.save();
        
        // Actualizar inventario
        const inventory = await Inventory.findOne({ product: item.productId });
        if (inventory) {
          inventory.currentStock -= item.quantity;
          inventory.pendingProduction += item.quantity;
          await inventory.save();
        }
      }
    }
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
  }
};

// Actualizar el estado de un pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Se requiere proporcionar un estado' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Si el pedido se marca como entregado, actualizar la producción pendiente
    if (status === 'delivered') {
      for (const item of order.products) {
        const inventory = await Inventory.findOne({ product: item.productId });
        if (inventory) {
          inventory.pendingProduction -= item.quantity;
          await inventory.save();
        }
      }
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado del pedido', error: error.message });
  }
};

// Actualizar el estado de pago de un pedido
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentDetails } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({ message: 'Se requiere proporcionar un estado de pago' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus,
        ...(paymentDetails && { paymentDetails })
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de pago', error: error.message });
  }
};

// Cancelar un pedido
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Solo se pueden cancelar pedidos pendientes o confirmados
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'No se puede cancelar un pedido que ya está en preparación o entregado' 
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    // Devolver productos al inventario
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Restaurar stock del producto
        product.stock += item.quantity;
        await product.save();
        
        // Actualizar inventario
        const inventory = await Inventory.findOne({ product: item.productId });
        if (inventory) {
          inventory.currentStock += item.quantity;
          inventory.pendingProduction -= item.quantity;
          await inventory.save();
        }
      }
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar el pedido', error: error.message });
  }
};

// Obtener estadísticas de ventas por período
exports.getSalesStats = async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly, yearly
    let groupBy = {};
    let dateFormat = "";
    
    // Configurar agrupación según el período solicitado
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
        dateFormat = "%Y-%m-%d";
        break;
      case 'weekly':
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" }
        };
        dateFormat = "%Y-W%V";
        break;
      case 'monthly':
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
        dateFormat = "%Y-%m";
        break;
      case 'yearly':
      default:
        groupBy = {
          year: { $year: "$createdAt" }
        };
        dateFormat = "%Y";
        break;
    }
    
    const stats = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid", // Solo órdenes pagadas
          status: { $nin: ["cancelled"] } // Excluir órdenes canceladas
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          totalSales: { $sum: "$totalAmount" },
          averageOrder: { $avg: "$totalAmount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 }
      },
      {
        $project: {
          _id: 0,
          period: {
            $dateToString: {
              format: dateFormat,
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: { $ifNull: ["$_id.month", 1] },
                  day: { $ifNull: ["$_id.day", 1] },
                  week: { $ifNull: ["$_id.week", 1] }
                }
              }
            }
          },
          count: 1,
          totalSales: 1,
          averageOrder: 1
        }
      }
    ]);
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas de ventas', error: error.message });
  }
};

// Obtener productos más vendidos
exports.getMostSoldProducts = async (req, res) => {
  try {
    const { limit = 10, dateFrom, dateTo } = req.query;
    
    // Crear filtro de fechas si se proporcionan
    const dateFilter = {};
    if (dateFrom) {
      dateFilter.createdAt = { $gte: new Date(dateFrom) };
    }
    if (dateTo) {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(dateTo) };
    }
    
    const mostSoldProducts = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
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
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json(mostSoldProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos más vendidos', error: error.message });
  }
};

// Obtener reporte de ventas por categoría
exports.getSalesByCategory = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Crear filtro de fechas si se proporcionan
    const dateFilter = {};
    if (dateFrom) {
      dateFilter.createdAt = { $gte: new Date(dateFrom) };
    }
    if (dateTo) {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(dateTo) };
    }
    
    // Obtener todos los productos para mapear IDs a categorías
    const products = await Product.find({}, 'category');
    const productCategories = {};
    
    products.forEach(product => {
      productCategories[product._id.toString()] = product.category;
    });
    
    // Obtener pedidos y agrupar por categoría
    const orders = await Order.find({
      ...dateFilter,
      status: { $nin: ["cancelled"] },
      paymentStatus: "paid"
    });
    
    // Procesar pedidos manualmente para agrupar por categoría
    const categorySales = {};
    
    orders.forEach(order => {
      order.products.forEach(product => {
        const productId = product.productId.toString();
        const category = productCategories[productId] || 'Sin categoría';
        
        if (!categorySales[category]) {
          categorySales[category] = {
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        
        categorySales[category].totalQuantity += product.quantity;
        categorySales[category].totalRevenue += product.price * product.quantity;
        categorySales[category].orderCount += 1;
      });
    });
    
    // Convertir a array y ordenar por ingresos
    const result = Object.entries(categorySales).map(([category, stats]) => ({
      category,
      ...stats
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas por categoría', error: error.message });
  }
};

// Obtener resumen completo para el dashboard
exports.getDashboardSummary = async (req, res) => {
  try {
    // Obtener fecha actual y fechas para comparar períodos
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // 1. Ventas totales (mes actual)
    const totalSalesMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth, $lt: nextMonth },
          paymentStatus: "paid",
          status: { $nin: ["cancelled"] }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    
    // 2. Ventas totales (mes anterior para comparación)
    const totalSalesLastMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $lt: currentMonth },
          paymentStatus: "paid",
          status: { $nin: ["cancelled"] }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    
    // 3. Ventas de hoy
    const todaySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          },
          paymentStatus: "paid",
          status: { $nin: ["cancelled"] }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    
    // 4. Pedidos pendientes
    const pendingOrders = await Order.countDocuments({
      status: "pending"
    });
    
    // 5. Productos con stock bajo
    const lowStockProducts = await Inventory.countDocuments({
      currentStock: { $lte: "$reorderLevel" }
    });
    
    // 6. Top 5 productos más vendidos (mes actual)
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
    
    // Construir objeto de respuesta
    const response = {
      currentMonth: {
        sales: totalSalesMonth.length > 0 ? totalSalesMonth[0].totalAmount : 0,
        orders: totalSalesMonth.length > 0 ? totalSalesMonth[0].orderCount : 0
      },
      lastMonth: {
        sales: totalSalesLastMonth.length > 0 ? totalSalesLastMonth[0].totalAmount : 0,
        orders: totalSalesLastMonth.length > 0 ? totalSalesLastMonth[0].orderCount : 0
      },
      today: {
        sales: todaySales.length > 0 ? todaySales[0].totalAmount : 0,
        orders: todaySales.length > 0 ? todaySales[0].orderCount : 0
      },
      pendingOrders,
      lowStockProducts,
      topProducts,
      percentChange: {
        sales: totalSalesLastMonth.length > 0 && totalSalesLastMonth[0].totalAmount > 0
          ? ((totalSalesMonth.length > 0 ? totalSalesMonth[0].totalAmount : 0) - totalSalesLastMonth[0].totalAmount) / totalSalesLastMonth[0].totalAmount * 100
          : 0,
        orders: totalSalesLastMonth.length > 0 && totalSalesLastMonth[0].orderCount > 0
          ? ((totalSalesMonth.length > 0 ? totalSalesMonth[0].orderCount : 0) - totalSalesLastMonth[0].orderCount) / totalSalesLastMonth[0].orderCount * 100
          : 0
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener resumen del dashboard', error: error.message });
  }
};
