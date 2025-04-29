require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    DB: process.env.MONGODB_URI || 'mongodb://localhost:27017/beach-rental',
    JWT_SECRET: process.env.JWT_SECRET || 'beach-rental-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d'
};
