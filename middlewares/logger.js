/**
 * @file logger.js
 * @description This file contains middleware for logging HTTP request and response details.
 * The `logger` middleware captures information about the HTTP request and response, including
 * the HTTP method, URL, response status code, and the duration of the request.
 * It logs this information to a database for monitoring and auditing purposes.
 * 
 * The middleware performs the following actions:
 * - Records the start time when the request is received.
 * - Attaches an event listener to the response object to capture the finish time once the response is sent.
 * - Calculates the duration of the request and constructs a log message with HTTP method, URL, status code, and duration.
 * - Logs the request information to the database, including user ID if available.
 * - Handles errors that occur during the logging process and outputs them to the console.
 * 
 * @module logger
 * @requires ../models
 * 
 * @example
 * const logger = require('./path/to/logger');
 * app.use(logger);
 */

const db = require('../models');

/**
 * Middleware function to log HTTP request and response details.
 * 
 * @function
 * @param {Object} req - The request object, which includes information about the HTTP request.
 * @param {Object} res - The response object, which includes information about the HTTP response.
 * @param {Function} next - The next middleware function to be called in the request-response cycle.
 * 
 * @returns {void} Passes control to the next middleware after logging the request details.
 * 
 * @throws {Error} If logging fails, an error is logged to the console.
 */
const logger = async (req, res, next) => {
    const start = Date.now();
    res.on('finish', async () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

        let userId = null;
        if (req.user) {
            userId = req.user.id; // Assumes user ID is stored in req.user
        } else {
            userId = null
        }

        try {
            await db.log.create({
                level: 'info',
                message: logMessage,
                userId: userId
            });
        } catch (error) {
            console.error('Failed to log request:', error);
        }
    });

    next();
};

module.exports = logger;