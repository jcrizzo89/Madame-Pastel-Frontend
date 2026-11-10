const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Rutas para pagos
router.post('/preference', paymentController.createPaymentPreference);
router.post('/transfer', paymentController.processTransferPayment);
router.patch('/transfer/confirm/:orderId', protect, isAdmin, paymentController.confirmTransferPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/webhook', paymentController.handleWebhook); // MercadoPago puede enviar GET también

module.exports = router;
