/**
 * @file app.js
 * @description This file initializes and configures the Express server for the API.
 * 
 * The server uses environment variables, sets up middleware, handles CORS, and connects to the PostgreSQL database.
 * It also configures Swagger for API documentation and sets up routes for authentication, user management, and role management.
 * 
 * Key features:
 * 
 * - Initializes environment variables using dotenv.
 * - Sets up middleware for request parsing, logging, and CORS.
 * - Configures PostgreSQL database connection and synchronization.
 * - Sets up Swagger documentation.
 * - Defines API routes.
 * - Handles 404 errors for undefined routes.
 * 
 * @module server
 */

require('dotenv').config();
const express = require('express');
const pk = require('./package.json');
const cors = require('cors');
const swaggerConfig = require('./config/swagger.config');
const config = require('./config/config');
const db = require('./models');
const { logger } = require('./middlewares');
const app = express();

// Middleware for parsing URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply logging middleware
app.use(logger);

// Configure CORS
const allowlist = config.corsAllowList?.split(',');
if (allowlist) {
    const corsOptionsDelegate = (req, callback) => {
        let corsOptions;

        let isDomainAllowed = allowlist.indexOf(req.header('Origin')) !== -1;

        if (isDomainAllowed) {
            // Enable CORS for this request
            corsOptions = { origin: true };
        } else {
            // Disable CORS for this request
            corsOptions = { origin: false };
        }
        callback(null, corsOptions);
    };

    app.use(cors(corsOptionsDelegate));
} else {
    app.use(cors());
}

// Synchronize the database and initialize roles
db.sequelize.sync({ force: true }).then(() => {
    initial();
});

// Set up Swagger API documentation
swaggerConfig(app);

// Root route
app.get('/', (req, res) => {
    res.send({
        statusCode: 200,
        message: `API Version :- ${pk.version}`
    });
});

// Import and use routes
require('./routes/auth.route')(app);
require('./routes/user.route')(app);
require('./routes/role.route')(app);

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).send({
        statusCode: 404,
        message: `invalid entry`
    });
});

// Start the server
const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not defined
const server = app.listen(PORT, () => {
    console.log(`API Version :- ${pk.version}`);
});

module.exports = server;

// Initialize roles in the database
async function initial() {
    await db.role.create({ roleName: 'user', description: "User Role" });
    await db.role.create({ roleName: 'admin', description: "Administrator role" });
}
