/**
 * @file validators.js
 * @description This file contains validation middleware functions for various API endpoints using `express-validator`.
 * The validation rules ensure that incoming requests meet the required format and constraints before proceeding to the route handlers.
 * 
 * Validation middleware functions are defined for:
 * - Authentication (login, signup, email verification, password reset)
 * - User management (user update, change password)
 * - Role management (assign roles, create roles)
 * 
 * Each validation function exports an array of validation rules and error messages that are used to validate the request data.
 * 
 * @module validators
 * 
 * @example
 * const { validateLogin, validateSignup } = require('./path/to/validators');
 * app.post('/login', validateLogin, authController.login);
 * app.post('/signup', validateSignup, authController.signup);
 */

const { body, param, oneOf } = require('express-validator');

/**
 * Validation middleware for user login.
 * 
 * @function
 * @returns {Array} An array of validation rules for login.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateLogin = [
    oneOf([
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Valid email is required'),
    ]),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation middleware for user signup.
 * 
 * @function
 * @returns {Array} An array of validation rules for signup.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateSignup = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation middleware for resending verification email.
 * 
 * @function
 * @returns {Array} An array of validation rules for resending verification email.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateResendVerification = [
    body('email').isEmail().withMessage('Valid email is required'),
];

/**
 * Validation middleware for verification token.
 * 
 * @function
 * @returns {Array} An array of validation rules for verification token.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateVerificationToken = [
    param('token').notEmpty().withMessage('Verification token is required'),
];

/**
 * Validation middleware for forgot password request.
 * 
 * @function
 * @returns {Array} An array of validation rules for forgot password.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateForgotPassword = [
    body('email').isEmail().withMessage('Valid email is required'),
];

/**
 * Validation middleware for resetting password.
 * 
 * @function
 * @returns {Array} An array of validation rules for reset password.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateResetPassword = [
    param('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation middleware for changing user password.
 * 
 * @function
 * @returns {Array} An array of validation rules for changing password.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateChangePassword = [
    body('currentPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

/**
 * Validation middleware for updating user details.
 * 
 * @function
 * @returns {Array} An array of validation rules for user update.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateUserUpdate = [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('username').optional().notEmpty().withMessage('Username is required'),
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('phoneNumber').optional().notEmpty().withMessage('Phone Number is required'),
];

/**
 * Validation middleware for getting user roles.
 * 
 * @function
 * @returns {Array} An array of validation rules for getting user roles.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateGetUserRoles = [
    param('userId').notEmpty().withMessage('User ID is required'),
];

/**
 * Validation middleware for assigning roles to users.
 * 
 * @function
 * @returns {Array} An array of validation rules for assigning roles.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateAssignRoleToUser = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('roleId').notEmpty().withMessage('Role ID is required'),
];

/**
 * Validation middleware for creating new roles.
 * 
 * @function
 * @returns {Array} An array of validation rules for creating roles.
 * @throws {ValidationError} If validation fails, appropriate error messages are returned.
 */
exports.validateCreateRole = [
    body('roleName').notEmpty().withMessage('Role Name is required'),
    body('description').optional().notEmpty().withMessage('Description is required'),
];
