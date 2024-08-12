/**
 * @file auth.route.js
 * @description This file defines the routes related to user authentication and authorization,
 * including login, signup, password management, and email verification. 
 * It uses middleware for validation and token verification, and sets up Swagger documentation
 * for each route to provide API details and usage instructions.
 * 
 * The routes include:
 * - **POST /login**: Authenticates a user and returns a JWT token.
 * - **POST /signup**: Registers a new user and sends a verification email.
 * - **POST /resend-verification**: Resends the verification email to the user.
 * - **GET /verification/:token**: Verifies the user's email using a token.
 * - **GET /verify**: Verifies the user's authentication status.
 * - **POST /forgot-password**: Initiates password reset by sending a reset link to the user.
 * - **POST /reset-password/:token**: Resets the user's password using a token.
 * - **GET /logout**: Logs out the user by invalidating the JWT token.
 * 
 * Middleware functions used:
 * - `verifyToken`: Validates the JWT token and attaches user information to the request.
 * - `validationErrorHandler`: Handles validation errors.
 * - Validation functions from `middlewares/validators`: Ensures that request data meets the required formats.
 * 
 * @module auth.route
 * @requires ../controllers/auth.controller
 * @requires ../middlewares
 * @requires ../middlewares/validators
 * 
 * @param {object} app - The Express application object.
 * @function
 * @description Configures routes for authentication and authorization,
 * includes middleware for validation and token management, and sets up Swagger documentation
 * for the defined routes.
 */
const authController = require('../controllers/auth.controller');
const { verifyToken, validationErrorHandler } = require('../middlewares');
const { validateSignup, validateResendVerification, validateVerificationToken, validateForgotPassword, validateResetPassword, validateLogin } = require('../middlewares/validators');

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
     * /login:
     *   post:
     *     summary: Login user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *                 example: testuser
     *               password:
     *                 type: string
     *                 example: password123
     *     responses:
     *       200:
     *         description: Successful login
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *       400:
     *         description: Missing username or password
     *       401:
     *         description: Invalid username or password
     *       500:
     *         description: Server error
     */
    app.post('/login', [validateLogin, validationErrorHandler], authController.login);

    /**
     * @swagger
     * /signup:
     *   post:
     *     summary: Sign up a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *                 example: testuser
     *               email:
     *                 type: string
     *                 example: test@example.com
     *               password:
     *                 type: string
     *                 example: password123
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 token:
     *                   type: string
     *       400:
     *         description: Missing username, email, or password
     *       500:
     *         description: Internal server error
     */
    app.post('/signup', [validateSignup, validationErrorHandler], authController.signup);

    /**
     * @swagger
     * /resend-verification:
     *   post:
     *     summary: Resend email verification
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 example: test@example.com
     *     responses:
     *       200:
     *         description: Verification email resent successfully
     *       400:
     *         description: User is already verified or missing email
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
    app.post('/resend-verification', [validateResendVerification, validationErrorHandler], authController.resendVerificationEmail);

    /**
     * @swagger
     * /verification/{token}:
     *   get:
     *     summary: Verify user email
     *     tags: [Auth]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *           example: verificationtoken123
     *     responses:
     *       200:
     *         description: User verified successfully
     *       400:
     *         description: Invalid or expired verification link
     *       500:
     *         description: Internal server error
     */
    app.get('/verification/:token', [validateVerificationToken, validationErrorHandler], authController.verification);

    /**
     * @swagger
     * /verify:
     *   get:
     *     summary: Verify user authentication
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: User is authenticated
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    app.get('/verify', [verifyToken], authController.verifyUser);

    /**
     * @swagger
     * /forgot-password:
     *   post:
     *     summary: Request password reset
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 example: test@example.com
     *     responses:
     *       200:
     *         description: Password reset email sent successfully
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
    app.post('/forgot-password', [validateForgotPassword, validationErrorHandler], authController.forgotPassword);

    /**
     * @swagger
     * /reset-password/{token}:
     *   post:
     *     summary: Reset user password
     *     tags: [Auth]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *           example: passwordresettoken123
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               newPassword:
     *                 type: string
     *                 example: newpassword123
     *     responses:
     *       200:
     *         description: Password reset successfully
     *       400:
     *         description: Invalid or expired reset token
     *       500:
     *         description: Internal server error
     */
    app.post('/reset-password/:token', [validateResetPassword, validationErrorHandler], authController.resetPassword);

    /**
     * @swagger
     * /logout:
     *   get:
     *     summary: Logout user
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: User logged out successfully
     *       500:
     *         description: Internal server error
     */
    app.get('/logout', [verifyToken], authController.logout);
}
