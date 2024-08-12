/**
 * @file validationErrorHandler.js
 * @description This file contains middleware for handling validation errors in HTTP requests.
 * The `validationErrorHandler` middleware processes the validation results of requests and sends 
 * an appropriate response if any validation errors are detected.
 * 
 * The middleware performs the following actions:
 * - Uses `express-validator` to gather validation errors from the request.
 * - Checks if there are any validation errors.
 * - If errors are present, sends a `400 Bad Request` response with the error details.
 * - If no errors are found, passes control to the next middleware or route handler.
 * 
 * @module validationErrorHandler
 * @requires express-validator
 * 
 * @example
 * const validationErrorHandler = require('./path/to/validationErrorHandler');
 * app.use(validationErrorHandler);
 */

/**
 * Middleware function to handle validation errors.
 * 
 * @function
 * @param {Object} req - The request object, which includes information about the HTTP request.
 * @param {Object} res - The response object, which includes information about the HTTP response.
 * @param {Function} next - The next middleware function to be called in the request-response cycle.
 * 
 * @returns {void} If validation errors are present, responds with a `400 Bad Request` status and error details.
 * If no validation errors are found, passes control to the next middleware or route handler.
 * 
 * @throws {Error} If any unexpected error occurs, it is not handled explicitly by this middleware.
 */
const { validationResult } = require('express-validator');

const validationErrorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = validationErrorHandler;
