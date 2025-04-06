const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Ruta para enviar un correo de prueba (sólo accesible por admin)
router.post('/test-email', auth, async (req, res) => {
  try {
    const { email, template } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }
    
    let result;
    const testUser = {
      firstName: 'Cliente',
      lastName: 'Prueba',
      email: email
    };
    
    // Generar datos de ejemplo según la plantilla solicitada
    switch (template) {
      case 'order-confirmation':
        const testOrder = {
          _id: 'TEST12345',
          createdAt: new Date(),
          status: 'confirmed',
          items: [
            { name: 'Torta de Chocolate', quantity: 1, price: 2500, options: 'Sin TACC' },
            { name: 'Cupcakes de Vainilla', quantity: 6, price: 300 }
          ],
          subtotal: 4300,
          deliveryFee: 500,
          discountAmount: 0,
          total: 4800,
          deliveryMethod: 'delivery',
          paymentMethod: 'transfer',
          shippingAddress: {
            street: 'Calle Ejemplo 123',
            city: 'Mar del Plata',
            zipCode: '7600',
            instructions: 'Timbre 2B'
          }
        };
        result = await emailService.sendOrderConfirmation(testOrder, testUser);
        break;
      
      case 'promotion-notification':
        const testPromotion = {
          promotionName: 'Oferta de Verano',
          promotionDescription: 'Disfruta de estas deliciosas ofertas para refrescarte en este verano',
          promotionStartDate: new Date(),
          promotionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días después
          discountPercentage: 20,
          promotionImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
          products: [
            { name: 'Torta Helada', price: 3000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587' },
            { name: 'Cupcakes Frutales', price: 2500, image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d' },
            { name: 'Macarons de Frutilla', price: 1800, image: 'https://images.unsplash.com/photo-1612201143788-b15844da6cc8' },
            { name: 'Cheesecake', price: 2200, image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636' }
          ]
        };
        result = await emailService.sendPromotionNotification(testPromotion, testUser);
        break;
      
      default:
        return res.status(400).json({ error: 'Plantilla no válida' });
    }
    
    if (result.success) {
      res.status(200).json({ message: 'Correo de prueba enviado correctamente', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Error al enviar el correo de prueba', details: result.error });
    }
  } catch (error) {
    console.error('Error en el endpoint de prueba de email:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para enviar notificación de promoción a todos los usuarios o un segmento
router.post('/send-promotion', auth, async (req, res) => {
  try {
    const { promotionId, userSegment } = req.body;
    
    if (!promotionId) {
      return res.status(400).json({ error: 'El ID de la promoción es requerido' });
    }
    
    // Buscar la promoción
    const promotion = await Product.findById(promotionId);
    if (!promotion || !promotion.seasonalPromotion) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }
    
    // Buscar productos relacionados con la misma promoción
    const relatedProducts = await Product.find({
      seasonalPromotion: true,
      promotionName: promotion.promotionName,
      _id: { $ne: promotionId }
    }).limit(3);
    
    // Crear objeto de promoción con productos relacionados
    const promotionData = {
      promotionName: promotion.promotionName,
      promotionDescription: promotion.promotionDescription,
      promotionStartDate: promotion.promotionStartDate,
      promotionEndDate: promotion.promotionEndDate,
      discountPercentage: promotion.discountPercentage,
      promotionImage: promotion.image,
      products: [promotion, ...relatedProducts].map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image
      }))
    };
    
    // Buscar usuarios para enviar el correo
    let query = {};
    if (userSegment === 'customers') {
      query = { role: 'customer', hasOrdered: true };
    } else if (userSegment === 'subscribers') {
      query = { isSubscribed: true };
    }
    
    const users = await User.find(query);
    if (users.length === 0) {
      return res.status(404).json({ error: 'No se encontraron usuarios para enviar la notificación' });
    }
    
    // Enviar correos (de forma asíncrona para no bloquear la respuesta)
    let successCount = 0;
    let errorCount = 0;
    
    // Creamos un array de promesas para enviar todos los correos
    const emailPromises = users.map(async (user) => {
      try {
        const result = await emailService.sendPromotionNotification(promotionData, user);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        errorCount++;
      }
    });
    
    // Esto devolverá la respuesta inmediatamente mientras los correos se envían en segundo plano
    res.status(200).json({ 
      message: 'El proceso de envío de notificaciones ha comenzado',
      totalUsers: users.length
    });
    
    // Procesamos todas las promesas y registramos el resultado final
    Promise.all(emailPromises).then(() => {
      console.log(`Notificación de promoción enviada: ${successCount} exitosos, ${errorCount} errores`);
    }).catch(error => {
      console.error('Error al enviar notificaciones de promoción:', error);
    });
    
  } catch (error) {
    console.error('Error en el endpoint de envío de promoción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para enviar notificación de orden (usado cuando se crea o actualiza un pedido)
router.post('/order-notification', auth, async (req, res) => {
  try {
    const { orderId, notificationType } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'El ID del pedido es requerido' });
    }
    
    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Buscar el cliente
    const customer = await User.findById(order.customer);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Enviar notificación según el tipo
    let result;
    
    switch (notificationType) {
      case 'confirmation':
        result = await emailService.sendOrderConfirmation(order, customer);
        break;
      
      case 'status_update':
        result = await emailService.sendOrderStatusUpdate(order, customer);
        break;
      
      default:
        return res.status(400).json({ error: 'Tipo de notificación no válido' });
    }
    
    if (result.success) {
      res.status(200).json({ message: 'Notificación enviada correctamente', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Error al enviar la notificación', details: result.error });
    }
  } catch (error) {
    console.error('Error en el endpoint de notificación de orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
