require('./config/loadEnv');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getMongoUri } = require('./config/databaseConfig');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const configRoutes = require('./routes/configRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : '*';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins === '*' || (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado por política CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiters for sensitive endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.'
  }
});

// MongoDB Connection (evitar conexión automática en entorno de testing)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(getMongoUri())
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    timestamp: new Date().toISOString(),
    database: databaseConnected ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.send('Madame Pastel API is running...');
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', sensitiveLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', sensitiveLimiter, paymentRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
