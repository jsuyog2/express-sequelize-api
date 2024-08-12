/**
 * @file role.controller.js
 * @description This file contains the controller functions for managing user roles within the application.
 * It includes functions to create new roles, assign roles to users, and retrieve roles assigned to a specific user.
 * The role management system helps in implementing role-based access control (RBAC), ensuring that users have the appropriate permissions.
 * The controller interacts with the database to perform CRUD operations related to user roles.
 */

const db = require('../models');

/**
 * Controller function to create a new role
 * @param {Object} req - The request object containing role details in the body
 * @param {Object} res - The response object to send back the created role or an error message
 * @returns {void}
 * @description This function takes the role name and description from the request body, creates a new role in the database, and returns the created role.
 *  If an error occurs during the process, it returns a 500 status code with an error message.
 */
exports.createRole = async (req, res) => {
    const { roleName, description } = req.body;
    try {
        const role = await db.role.create({ roleName, description });
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error creating role', error: error.message });
    }
};

/**
 * Controller function to assign a role to a user
 * @param {Object} req - The request object containing userId and roleId in the body
 * @param {Object} res - The response object to send back a success message or an error message
 * @returns {void}
 * @description This function takes the user ID and role ID from the request body, assigns the specified role to the user in the database, 
 * and returns a success message. If an error occurs during the process, it returns a 500 status code with an error message.
 */
exports.assignRoleToUser = async (req, res) => {
    const { userId, roleId } = req.body;
    try {
        await db.user_roles.create({ userId, roleId });
        res.status(200).json({ message: 'Role assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning role', error: error.message });
    }
};

/**
 * Controller function to get roles assigned to a specific user
 * @param {Object} req - The request object containing userId as a URL parameter
 * @param {Object} res - The response object to send back the roles or an error message
 * @returns {void}
 * @description This function takes the user ID from the URL parameters, retrieves the roles assigned to the user from the database, 
 * and returns the roles. If the user is not found, it returns a 401 status code with an error message. If an error occurs during the process, 
 * it returns a 500 status code with an error message.
 */
exports.getUserRoles = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await db.user.findByPk(userId, { include: [db.role] });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const userRoles = user.Roles?.map((val) => val.roleName);
        res.status(200).json(userRoles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user roles', error: error.message });
    }
};
