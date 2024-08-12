/**
 * @file user.route.js
 * @description This file defines the routes related to user management within the application,
 * including retrieving user details, updating user information, and changing the user password. 
 * It uses middleware for token verification and request validation.
 * 
 * The routes include:
 * - **GET /user**: Retrieves details of the currently authenticated user.
 * - **PUT /user**: Updates the details of the currently authenticated user.
 * - **POST /user/change-password**: Changes the password for the currently authenticated user.
 * 
 * Middleware functions used:
 * - `verifyToken`: Validates the JWT token and attaches user information to the request.
 * - `validationErrorHandler`: Handles validation errors from request data.
 * - Validation functions from `middlewares/validators`: Ensures that request data for user updates and password changes meet the required formats.
 * 
 * @module user.route
 * @requires ../controllers/user.controller
 * @requires ../middlewares
 * @requires ../middlewares/validators
 * 
 * @param {object} app - The Express application object.
 * @function
 * @description Configures routes for user management, including middleware for token verification and validation. 
 * Ensures that all routes require a valid token and includes Swagger documentation for the defined routes.
 */
const userController = require('../controllers/user.controller');
const { verifyToken, validationErrorHandler } = require('../middlewares');
const { validateUserUpdate, validateChangePassword } = require('../middlewares/validators');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    /**
     * @swagger
     * /user:
     *   get:
     *     summary: Get user details
     *     tags: [User]
     *     responses:
     *       200:
     *         description: Successfully retrieved user details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 username:
     *                   type: string
     *                   example: testuser
     *                 email:
     *                   type: string
     *                   example: test@example.com
     *                 name:
     *                   type: string
     *                   example: John Doe
     *                 phoneNumber:
     *                   type: string
     *                   example: 123-456-7890
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal server error
     */
    app.get('/user', [verifyToken], userController.getUser);

    /**
     * @swagger
     * /user:
     *   put:
     *     summary: Update user details
     *     tags: [User]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *                 example: newusername
     *               email:
     *                 type: string
     *                 example: newemail@example.com
     *               name:
     *                 type: string
     *                 example: Jane Doe
     *               phoneNumber:
     *                 type: string
     *                 example: 987-654-3210
     *     responses:
     *       200:
     *         description: User details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 username:
     *                   type: string
     *                   example: newusername
     *                 email:
     *                   type: string
     *                   example: newemail@example.com
     *                 name:
     *                   type: string
     *                   example: Jane Doe
     *                 phoneNumber:
     *                   type: string
     *                   example: 987-654-3210
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal server error
     */
    app.put('/user', [verifyToken, validateUserUpdate, validationErrorHandler], userController.updateUser);

    /**
     * @swagger
     * /user/change-password:
     *   post:
     *     summary: Change user password
     *     tags: [User]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               currentPassword:
     *                 type: string
     *                 example: oldpassword123
     *               newPassword:
     *                 type: string
     *                 example: newpassword123
     *     responses:
     *       200:
     *         description: Password changed successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized access or incorrect current password
     *       500:
     *         description: Internal server error
     */
    app.post('/user/change-password', [verifyToken, validateChangePassword, validationErrorHandler], userController.changePassword);
};
