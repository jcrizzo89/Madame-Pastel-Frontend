const { createTransporter } = require('../config/emailConfig');
const config = require('../config/config');

// Servicio de email para la aplicación
class EmailService {
  constructor() {
    this.transporter = createTransporter();
    this.defaultEmail = process.env.EMAIL_FROM || 'Madame Pastel <madamepastelmdp@gmail.com>';
  }
  
  // Función para enviar un correo genérico
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: options.from || this.defaultEmail,
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: {
          ...options.context,
          storeName: 'Madame Pastel',
          storeLogo: 'https://madamepastel.com/logo.png', // Reemplazar con la URL real del logo
          storeEmail: 'madamepastelmdp@gmail.com',
          storePhone: '+54 9 223 123 4567',
          storeAddress: 'Calle Ejemplo 123, Mar del Plata, Argentina',
          currentYear: new Date().getFullYear(),
          instagramLink: 'https://www.instagram.com/madamepastelmdp',
          facebookLink: 'https://www.facebook.com/madamepastelmdp',
          unsubscribeLink: 'https://madamepastel.com/unsubscribe',
        },
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Enviar confirmación de pedido
  async sendOrderConfirmation(order, customer) {
    const deliveryMethod = order.deliveryMethod || 'pickup';
    const paymentMethod = order.paymentMethod || 'transfer';
    
    // Formatear los productos en el pedido
    const items = order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      subtotal: (item.price * item.quantity).toFixed(2),
      options: item.options || null
    }));
    
    // Formatear las fechas
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    
    // Fecha estimada de entrega (2 días después del pedido)
    const deliveryDate = new Date(order.createdAt);
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    
    // Configurar el contexto de la plantilla
    const context = {
      customerName: customer.firstName,
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      orderDate,
      orderStatus: this.getOrderStatusText(order.status),
      items,
      subtotal: order.subtotal.toFixed(2),
      deliveryFee: order.deliveryFee ? order.deliveryFee.toFixed(2) : null,
      discountAmount: order.discountAmount ? order.discountAmount.toFixed(2) : null,
      total: order.total.toFixed(2),
      delivery: deliveryMethod === 'delivery',
      deliveryAddress: order.shippingAddress?.street,
      deliveryCity: order.shippingAddress?.city,
      deliveryZipCode: order.shippingAddress?.zipCode,
      deliveryInstructions: order.shippingAddress?.instructions || 'Sin instrucciones adicionales',
      deliveryDate: formattedDeliveryDate,
      pickupAddress: 'Calle Ejemplo 123, Mar del Plata',
      pickupHours: '10:00 - 19:00 hs',
      pickupDate: formattedDeliveryDate,
      paymentMethod: this.getPaymentMethodText(paymentMethod),
      transferInstructions: paymentMethod === 'transfer',
      bankAccountName: 'Madame Pastel S.R.L.',
      bankAccountCBU: '0000000000000000000000',
      bankAccountAlias: 'MADAME.PASTEL.MDP',
      bankName: 'Banco Nación',
      whatsappNumber: '+54 9 223 123 4567',
      orderTrackingLink: `https://madamepastel.com/pedidos/${order._id}`,
    };
    
    // Enviar el correo
    return this.sendEmail({
      to: customer.email,
      subject: '¡Tu pedido ha sido confirmado! - Madame Pastel',
      template: 'order-confirmation',
      context
    });
  }
  
  // Enviar notificación de cambio de estado del pedido
  async sendOrderStatusUpdate(order, customer) {
    const statusText = this.getOrderStatusText(order.status);
    const statusDescription = this.getOrderStatusDescription(order.status);
    
    const context = {
      customerName: customer.firstName,
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      orderStatus: statusText,
      statusDescription,
      orderDate: new Date(order.createdAt).toLocaleDateString('es-AR'),
      orderTrackingLink: `https://madamepastel.com/pedidos/${order._id}`,
    };
    
    return this.sendEmail({
      to: customer.email,
      subject: `Tu pedido ha sido ${statusText.toLowerCase()} - Madame Pastel`,
      template: 'order-status-update',
      context
    });
  }
  
  // Enviar notificación de promoción
  async sendPromotionNotification(promotion, customer) {
    // Calcular las fechas formateadas
    const startDate = new Date(promotion.promotionStartDate).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit'
    });
    
    const endDate = new Date(promotion.promotionEndDate).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit'
    });
    
    // Formatear los productos
    const products = promotion.products.map(product => ({
      name: product.name,
      image: product.image,
      originalPrice: product.price.toFixed(2),
      discountedPrice: (product.price * (1 - promotion.discountPercentage / 100)).toFixed(2)
    }));
    
    const context = {
      customerName: customer.firstName || 'Estimado/a',
      promotionName: promotion.promotionName || 'Ofertas Especiales',
      promotionDescription: promotion.promotionDescription || 'Aprovecha estas increíbles ofertas por tiempo limitado',
      promotionImage: promotion.promotionImage || 'https://madamepastel.com/images/promotion.jpg',
      discountPercentage: promotion.discountPercentage,
      startDate,
      endDate,
      products,
      promotionLink: 'https://madamepastel.com/promociones'
    };
    
    return this.sendEmail({
      to: customer.email,
      subject: `${promotion.promotionName || 'Ofertas Especiales'} - Madame Pastel`,
      template: 'promotion-notification',
      context
    });
  }
  
  // Enviar recordatorio de carrito abandonado
  async sendAbandonedCartReminder(cart, customer) {
    // Formatear los productos en el carrito
    const items = cart.items.map(item => ({
      name: item.product.name,
      image: item.product.image,
      price: item.product.price.toFixed(2),
      quantity: item.quantity
    }));
    
    const context = {
      customerName: customer.firstName || 'Estimado/a',
      items,
      cartTotal: cart.total.toFixed(2),
      cartLink: 'https://madamepastel.com/carrito'
    };
    
    return this.sendEmail({
      to: customer.email,
      subject: '¿Olvidaste algo en tu carrito? - Madame Pastel',
      template: 'abandoned-cart',
      context
    });
  }
  
  // Enviar bienvenida al cliente
  async sendWelcome(customer) {
    const context = {
      customerName: customer.firstName || 'Estimado/a',
      loginLink: 'https://madamepastel.com/login'
    };
    
    return this.sendEmail({
      to: customer.email,
      subject: '¡Bienvenido/a a Madame Pastel!',
      template: 'welcome',
      context
    });
  }
  
  // Obtener texto de estado del pedido
  getOrderStatusText(status) {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'preparing': 'En preparación',
      'ready': 'Listo para retirar',
      'shipped': 'En camino',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || 'Procesando';
  }
  
  // Obtener descripción de estado del pedido
  getOrderStatusDescription(status) {
    const descriptionMap = {
      'pending': 'Tu pedido está pendiente de confirmación.',
      'confirmed': 'Hemos confirmado tu pedido y pronto comenzaremos a prepararlo.',
      'preparing': 'Tu pedido está siendo preparado con todo el cariño y detalle que caracteriza a Madame Pastel.',
      'ready': 'Tu pedido está listo para ser retirado en nuestra tienda.',
      'shipped': 'Tu pedido está en camino a la dirección indicada.',
      'delivered': 'Tu pedido ha sido entregado con éxito.',
      'cancelled': 'Tu pedido ha sido cancelado.'
    };
    
    return descriptionMap[status] || 'Tu pedido está siendo procesado.';
  }
  
  // Obtener texto de método de pago
  getPaymentMethodText(method) {
    const methodMap = {
      'card': 'Tarjeta de crédito/débito',
      'transfer': 'Transferencia bancaria',
      'mercadopago': 'Mercado Pago',
      'cash': 'Efectivo al retirar',
      'cashOnDelivery': 'Efectivo contra entrega'
    };
    
    return methodMap[method] || 'Método de pago no especificado';
  }
}

module.exports = new EmailService();
