const mongoose = require('mongoose');
const CONFIG = require('./config');

module.exports = {
    connection: null,
    connect: () => {
        if (this.connection) return this.connection;
        return mongoose.connect(CONFIG.DB, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(connection => {
                this.connection = connection;
                console.log('Successfully connected to MongoDB database');
                return connection;
            })
            .catch(err => console.error('Database connection error:', err));
    }
};
