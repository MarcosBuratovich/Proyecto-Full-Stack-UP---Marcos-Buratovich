const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const productRoutes = require('./routes/product');
const safetyEquipmentRoutes = require('./routes/safetyEquipment');
const reservationRoutes = require('./routes/reservation');
const authRoutes = require('./routes/auth');
const availabilityRoutes = require('./routes/availability');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Beach Rental API',
        version: '1.0.0',
        description: 'API para gestión de alquileres de equipos de playa',
        documentation: 'Consulte GUIA_DE_PRUEBA.md para instrucciones detalladas'
    });
});

// API endpoints
app.use('/api/products', productRoutes);
app.use('/api/safety-equipment', safetyEquipmentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message
  });
});

module.exports = app;
