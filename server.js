require('dotenv').config();
const Database = require('./app/config/database');
const CONFIG = require('./app/config/config');
const app = require('./app/app');

// Connect to MongoDB
Database.connect();

// Start the server
app.listen(CONFIG.PORT, err => {
    if (err) return console.log(err);
    console.log(`Server running on port: ${CONFIG.PORT}`);
});
