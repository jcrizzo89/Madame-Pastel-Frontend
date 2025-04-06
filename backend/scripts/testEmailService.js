/**
 * Script para probar el servicio de email de Madame Pastel
 * 
 * Este script permite probar todas las funcionalidades del servicio de email
 * sin necesidad de ejecutar toda la aplicación
 */

const emailService = require('../services/emailService');
require('dotenv').config();

// Función principal de prueba
async function testEmailService() {
  console.log('Iniciando pruebas del servicio de email...');
  
  // Email de prueba (puede ser modificado)
  const testEmail = process.argv[2] || 'test@example.com';
  
  // Datos de prueba para cada tipo de email
  const mockCustomer = {
    _id: '60a1b2c3d4e5f6g7h8i9j0k1',
    firstName: 'Cliente',
    lastName: 'Prueba',
    email: testEmail,
    phone: '+54 9 223 1234567'
  };
  
  const mockOrder = {
    _id: '60a1b2c3d4e5f6g7h8i9j0k2',
    createdAt: new Date(),
    status: 'confirmed',
    items: [
      {
        name: 'Torta de Chocolate',
        quantity: 1,
        price: 5000,
        options: 'Sin decoración especial'
      },
      {
        name: 'Cupcakes Vainilla',
        quantity: 6,
        price: 2400,
        options: 'Decoración en rosa'
      }
    ],
    subtotal: 7400,
    deliveryFee: 600,
    discountAmount: 0,
    total: 8000,
    paymentMethod: 'transfer',
    deliveryMethod: 'pickup'
  };
  
  const mockPromotion = {
    _id: '60a1b2c3d4e5f6g7h8i9j0k3',
    promotionName: 'Descuentos de Otoño',
    promotionDescription: 'Aprovecha estos descuentos especiales para la temporada de otoño',
    promotionStartDate: new Date(),
    promotionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días después
    discountPercentage: 20,
    products: [
      {
        _id: '60a1b2c3d4e5f6g7h8i9j0k4',
        name: 'Torta Red Velvet',
        price: 6000,
        image: 'https://via.placeholder.com/300x300'
      },
      {
        _id: '60a1b2c3d4e5f6g7h8i9j0k5',
        name: 'Box de Macarons',
        price: 3500,
        image: 'https://via.placeholder.com/300x300'
      }
    ]
  };
  
  const mockCart = {
    _id: '60a1b2c3d4e5f6g7h8i9j0k6',
    items: [
      {
        product: {
          name: 'Cheesecake de Frutos Rojos',
          price: 5500,
          image: 'https://via.placeholder.com/300x300'
        },
        quantity: 1
      }
    ],
    total: 5500
  };
  
  // Tipo de email a probar (si se especifica como argumento)
  const emailType = process.argv[3];
  
  try {
    let result;
    
    switch (emailType) {
      case 'order':
        console.log(`Enviando email de confirmación de pedido a ${testEmail}...`);
        result = await emailService.sendOrderConfirmation(mockOrder, mockCustomer);
        break;
        
      case 'status':
        console.log(`Enviando email de actualización de pedido a ${testEmail}...`);
        result = await emailService.sendOrderStatusUpdate(mockOrder, mockCustomer);
        break;
        
      case 'promotion':
        console.log(`Enviando email de promoción a ${testEmail}...`);
        result = await emailService.sendPromotionNotification(mockPromotion, mockCustomer);
        break;
        
      case 'cart':
        console.log(`Enviando email de carrito abandonado a ${testEmail}...`);
        result = await emailService.sendAbandonedCartReminder(mockCart, mockCustomer);
        break;
        
      case 'welcome':
        console.log(`Enviando email de bienvenida a ${testEmail}...`);
        result = await emailService.sendWelcome(mockCustomer);
        break;
        
      default:
        // Probar todos los tipos de email
        console.log(`Enviando todos los tipos de emails a ${testEmail}...`);
        
        console.log('1. Email de confirmación de pedido');
        const orderResult = await emailService.sendOrderConfirmation(mockOrder, mockCustomer);
        console.log(orderResult.success ? '✅ Enviado correctamente' : '❌ Error al enviar');
        
        console.log('2. Email de actualización de pedido');
        const statusResult = await emailService.sendOrderStatusUpdate(mockOrder, mockCustomer);
        console.log(statusResult.success ? '✅ Enviado correctamente' : '❌ Error al enviar');
        
        console.log('3. Email de promoción');
        const promoResult = await emailService.sendPromotionNotification(mockPromotion, mockCustomer);
        console.log(promoResult.success ? '✅ Enviado correctamente' : '❌ Error al enviar');
        
        console.log('4. Email de carrito abandonado');
        const cartResult = await emailService.sendAbandonedCartReminder(mockCart, mockCustomer);
        console.log(cartResult.success ? '✅ Enviado correctamente' : '❌ Error al enviar');
        
        console.log('5. Email de bienvenida');
        const welcomeResult = await emailService.sendWelcome(mockCustomer);
        console.log(welcomeResult.success ? '✅ Enviado correctamente' : '❌ Error al enviar');
        
        break;
    }
    
    console.log('Pruebas completadas.');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar la función de prueba
testEmailService();
