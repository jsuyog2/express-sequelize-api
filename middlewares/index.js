/**
 * @file index.js
 * @description This module exports middleware functions for use in Express applications.
 * 
 * Middleware functions included:
 * - `verifyToken`: Verifies JWT tokens and attaches user information to the request.
 * - `logger`: Logs request details and response times to the database.
 * - `roleAuthorization`: Checks if a user has the required roles for accessing certain routes.
 * - `validationErrorHandler`: Handles validation errors and returns appropriate responses.
 * 
 * @module middlewares
 */

const verifyToken = require("./verifyToken");
const logger = require("./logger");
const roleAuthorization = require("./roleAuthorization");
const validationErrorHandler = require("./validationErrorHandler");

/**
 * Middleware functions to be used in Express routes.
 * 
 * @type {Object}
 * @property {Function} verifyToken - Middleware for verifying JWT tokens.
 * @property {Function} logger - Middleware for logging request details and response times.
 * @property {Function} roleAuthorization - Middleware for checking user roles and permissions.
 * @property {Function} validationErrorHandler - Middleware for handling validation errors.
 */
module.exports = {
    verifyToken,
    logger,
    roleAuthorization,
    validationErrorHandler
};
