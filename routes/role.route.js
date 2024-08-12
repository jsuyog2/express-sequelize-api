/**
 * @file role.route.js
 * @description This file defines the routes related to role management within the application,
 * including role creation, role assignment, and retrieval of user roles. 
 * It uses middleware for token verification, role-based authorization, and request validation.
 * 
 * The routes include:
 * - **POST /roles**: Creates a new role. Only accessible by users with the 'admin' role.
 * - **POST /assign-role**: Assigns a role to a user. Only accessible by users with the 'admin' role.
 * - **GET /user/:userId/roles**: Retrieves roles assigned to a user. Only accessible by users with the 'admin' role.
 * 
 * Middleware functions used:
 * - `verifyToken`: Validates the JWT token and attaches user information to the request.
 * - `roleAuthorization`: Checks if the user has the required role for accessing the route.
 * - `validationErrorHandler`: Handles validation errors from request data.
 * - Validation functions from `middlewares/validators`: Ensures that request data for creating roles, assigning roles, and retrieving user roles meet the required formats.
 * 
 * @module role.route
 * @requires ../controllers/role.controller
 * @requires ../middlewares
 * @requires ../middlewares/validators
 * 
 * @param {object} app - The Express application object.
 * @function
 * @description Configures routes for role management, including middleware for token verification, 
 * role-based access control, and validation. Ensures that only users with the 'admin' role can access 
 * specific routes and uses Swagger documentation for the defined routes.
 */
const roleController = require('../controllers/role.controller');
const { verifyToken, roleAuthorization, validationErrorHandler } = require('../middlewares');
const { validateAssignRoleToUser, validateCreateRole, validateGetUserRoles } = require('../middlewares/validators');

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
     * /roles:
     *   post:
     *     summary: Create a new role
     *     tags: [Role]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               roleName:
     *                 type: string
     *                 example: Admin
     *               description:
     *                 type: string
     *                 example: Administrator with full access
     *     responses:
     *       201:
     *         description: Role created successfully
     *       400:
     *         description: Invalid input
     *       403:
     *         description: Unauthorized access
     *       500:
     *         description: Internal server error
     */
    app.post('/roles', [validateCreateRole, validationErrorHandler, verifyToken, roleAuthorization(['admin'])], roleController.createRole);

    /**
     * @swagger
     * /assign-role:
     *   post:
     *     summary: Assign a role to a user
     *     tags: [Role]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userId:
     *                 type: integer
     *                 example: 1
     *               roleId:
     *                 type: integer
     *                 example: 2
     *     responses:
     *       200:
     *         description: Role assigned successfully
     *       400:
     *         description: Invalid input
     *       403:
     *         description: Unauthorized access
     *       500:
     *         description: Internal server error
     */
    app.post('/assign-role', [validateAssignRoleToUser, validationErrorHandler, verifyToken, roleAuthorization(['admin'])], roleController.assignRoleToUser);

    /**
     * @swagger
     * /user/{userId}/roles:
     *   get:
     *     summary: Get roles assigned to a user
     *     tags: [Role]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: integer
     *           example: 1
     *     responses:
     *       200:
     *         description: List of roles assigned to the user
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
     *       400:
     *         description: Invalid user ID
     *       403:
     *         description: Unauthorized access
     *       500:
     *         description: Internal server error
     */
    app.get('/user/:userId/roles', [validateGetUserRoles, validationErrorHandler, verifyToken, roleAuthorization(['admin'])], roleController.getUserRoles);
};
