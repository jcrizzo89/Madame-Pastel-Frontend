const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Order = require('../models/Order');
const dotenv = require('dotenv');

dotenv.config();

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
});

// Crear preferencia de pago para MercadoPago
exports.createPaymentPreference = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Se requiere un ID de orden válido' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Crear preferencia para MercadoPago
    const preference = {
      items: order.products.map(item => ({
        id: item.productId.toString(),
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'ARS' // Cambiar según el país
      })),
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/failure`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/pending`
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${process.env.BACKEND_URL || '${process.env.REACT_APP_API_URL}'}/api/payments/webhook`,
    };
    
    const preferenceClient = new Preference(client);
    const response = await preferenceClient.create({ body: preference });
    
    // Actualizar orden con detalles de pago
    order.paymentDetails = {
      preferenceId: response.id,
      initPoint: response.init_point,
      status: 'created'
    };
    await order.save();
    
    res.status(200).json({
      preferenceId: response.id,
      initPoint: response.init_point
    });
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    res.status(500).json({ message: 'Error al crear preferencia de pago', error: error.message });
  }
};

// Procesar pagos por transferencia
exports.processTransferPayment = async (req, res) => {
  try {
    const { orderId, transactionDetails } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Se requiere un ID de orden válido' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Actualizar orden con detalles de transferencia
    order.paymentMethod = 'transfer';
    order.paymentStatus = 'pending'; // Requiere verificación manual
    order.paymentDetails = {
      ...transactionDetails,
      timestamp: new Date()
    };
    await order.save();
    
    res.status(200).json({
      message: 'Datos de transferencia recibidos, pendiente de verificación',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar pago por transferencia', error: error.message });
  }
};

// Confirmar pago por transferencia (para el admin)
exports.confirmTransferPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    if (order.paymentMethod !== 'transfer') {
      return res.status(400).json({ message: 'Esta orden no utiliza pago por transferencia' });
    }
    
    // Actualizar estado de pago
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    await order.save();
    
    res.status(200).json({
      message: 'Pago por transferencia confirmado',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al confirmar pago por transferencia', error: error.message });
  }
};

// Recibir notificaciones de MercadoPago
exports.handleWebhook = async (req, res) => {
  try {
    const { query } = req;
    
    if (query.topic === 'payment') {
      const paymentId = query.id;
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: paymentId });
      
      if (payment && payment.id) {
        const { external_reference, status } = payment;
        
        if (external_reference) {
          const order = await Order.findById(external_reference);
          if (order) {
            // Actualizar estado de pago según respuesta de MercadoPago
            let paymentStatus = 'pending';
            
            if (status === 'approved') {
              paymentStatus = 'completed';
              order.status = 'confirmed';
            } else if (status === 'rejected') {
              paymentStatus = 'failed';
            }
            
            order.paymentStatus = paymentStatus;
            order.paymentDetails = {
              ...order.paymentDetails,
              mercadopagoStatus: status,
              paymentId,
              lastUpdated: new Date()
            };
            
            await order.save();
          }
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook de MercadoPago:', error);
    res.status(500).send('Error processing webhook');
  }
};
