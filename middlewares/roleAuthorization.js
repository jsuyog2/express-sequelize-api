/**
 * @file roleAuthorization.js
 * @description This file contains middleware for role-based access control in the application.
 * The `roleAuthorization` middleware ensures that a user has the required role(s) to access certain routes or resources.
 * 
 * The middleware function returned by `roleAuthorization` performs the following actions:
 * - Checks if the user information is present in the request object (`req.user`).
 * - Verifies if the user's role is included in the list of allowed roles provided.
 * - Responds with a `403 Forbidden` status if the user does not have the required permissions.
 * - Proceeds to the next middleware or route handler if the user has the necessary role(s).
 * 
 * @module roleAuthorization
 * 
 * @param {Array<string>} allowedRoles - An array of role names that are allowed to access the route.
 * 
 * @returns {Function} A middleware function that performs the role-based access check.
 * 
 * @example
 * const roleAuthorization = require('./path/to/roleAuthorization');
 * app.post('/admin', roleAuthorization(['admin']), adminController.doSomething);
 */

/**
 * Middleware function to authorize access based on user roles.
 * 
 * @function
 * @param {Array<string>} allowedRoles - An array of roles that are permitted to access the route.
 * @returns {Function} A middleware function that checks if the user's role matches one of the allowed roles.
 * 
 * @param {Object} req - The request object, which includes user information in `req.user`.
 * @param {Object} res - The response object, used to send responses back to the client.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * 
 * @throws {Error} If the user does not have the required role, a `403 Forbidden` response is sent.
 */
const roleAuthorization = (allowedRoles) => {
    return (req, res, next) => {
        // Ensure user information is present
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const found = allowedRoles.some(r => req.user.role.includes(r));
        // Check if the user's role is in the allowed roles
        if (!found) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        // Proceed to the next middleware or route handler
        next();
    };
};

module.exports = roleAuthorization;
