/**
 * @file role.test.js
 * @description This file contains unit tests for the `roleController` module, specifically testing the functionalities of creating roles, assigning roles to users, and retrieving user roles.
 * The tests verify that the controller methods handle requests and responses correctly, including both successful operations and error scenarios. The file uses `node-mocks-http` to simulate HTTP requests and responses and `jest` for mocking and assertions.
 *
 * The tests are organized into the following sections:
 * 
 * - **POST /role**: Tests for creating a new role.
 *   - **Success**: Verifies that a new role is created successfully and returns the correct response.
 *   - **Error**: Checks that errors during role creation are handled properly and the appropriate error message is returned.
 *
 * - **POST /role/assign**: Tests for assigning a role to a user.
 *   - **Success**: Ensures that a role is assigned to a user successfully and the correct success message is returned.
 *   - **Error**: Validates that errors during role assignment are managed properly and the correct error message is returned.
 *
 * - **GET /user/:userId/roles**: Tests for retrieving roles assigned to a user.
 *   - **Success**: Confirms that user roles are fetched successfully and returned in the correct format.
 *   - **User Not Found**: Tests the case where the user does not exist and ensures the correct error message is returned.
 *   - **Error**: Verifies that errors while fetching user roles are handled correctly and an appropriate error message is returned.
 */

require('dotenv').config();
const roleController = require('../controllers/role.controller');
const db = require('../models');
const httpMocks = require('node-mocks-http');

describe('Role Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /role', () => {
        /**
         * @function
         * @description Tests the `createRole` method in `roleController` to ensure it creates a new role successfully.
         * Verifies that the status code is 201 and the response contains the created role data.
         */
        it('should create a new role successfully', async () => {
            const roleData = { roleName: 'Admin', description: 'Administrator role' };
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/role',
                body: roleData
            });
            const res = httpMocks.createResponse();

            db.role.create = jest.fn().mockResolvedValue(roleData);

            await roleController.createRole(req, res);

            expect(res.statusCode).toBe(201);
            expect(JSON.parse(res._getData())).toEqual(roleData);
        });

        /**
         * @function
         * @description Tests the `createRole` method in `roleController` to handle errors during role creation.
         * Ensures that errors are caught and the correct error message is returned with a status code of 500.
         */
        it('should handle errors when creating a role', async () => {
            const roleData = { roleName: 'Admin', description: 'Administrator role' };
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/role',
                body: roleData
            });
            const res = httpMocks.createResponse();

            db.role.create = jest.fn().mockRejectedValue(new Error('Database error'));

            await roleController.createRole(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Error creating role', error: 'Database error' });
        });
    });

    describe('POST /role/assign', () => {
        /**
         * @function
         * @description Tests the `assignRoleToUser` method in `roleController` to ensure it assigns a role to a user successfully.
         * Verifies that the status code is 200 and the response contains a success message.
         */
        it('should assign a role to a user successfully', async () => {
            const assignmentData = { userId: 1, roleId: 2 };
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/role/assign',
                body: assignmentData
            });
            const res = httpMocks.createResponse();

            db.user_roles.create = jest.fn().mockResolvedValue(assignmentData);

            await roleController.assignRoleToUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Role assigned successfully' });
        });

        /**
         * @function
         * @description Tests the `assignRoleToUser` method in `roleController` to handle errors during role assignment.
         * Ensures that errors are caught and the correct error message is returned with a status code of 500.
         */
        it('should handle errors when assigning a role', async () => {
            const assignmentData = { userId: 1, roleId: 2 };
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/role/assign',
                body: assignmentData
            });
            const res = httpMocks.createResponse();

            db.user_roles.create = jest.fn().mockRejectedValue(new Error('Database error'));

            await roleController.assignRoleToUser(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Error assigning role', error: 'Database error' });
        });
    });

    describe('GET /user/:userId/roles', () => {
        /**
         * @function
         * @description Tests the `getUserRoles` method in `roleController` to ensure it retrieves user roles successfully.
         * Verifies that the status code is 200 and the response contains the list of roles assigned to the user.
         */
        it('should get user roles successfully', async () => {
            const userId = 1;
            const user = {
                id: userId,
                Roles: [{ roleName: 'Admin' }, { roleName: 'User' }]
            };
            const req = httpMocks.createRequest({
                method: 'GET',
                url: `/user/${userId}/roles`,
                params: { userId }
            });
            const res = httpMocks.createResponse();

            db.user.findByPk = jest.fn().mockResolvedValue(user);

            await roleController.getUserRoles(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(['Admin', 'User']);
        });

        /**
         * @function
         * @description Tests the `getUserRoles` method in `roleController` to handle cases where the user is not found.
         * Ensures that the correct error message is returned with a status code of 401.
         */
        it('should handle user not found error', async () => {
            const userId = 1;
            const req = httpMocks.createRequest({
                method: 'GET',
                url: `/user/${userId}/roles`,
                params: { userId }
            });
            const res = httpMocks.createResponse();

            db.user.findByPk = jest.fn().mockResolvedValue(null);

            await roleController.getUserRoles(req, res);

            expect(res.statusCode).toBe(401);
            expect(JSON.parse(res._getData())).toEqual({ message: 'User not found' });
        });

        /**
         * @function
         * @description Tests the `getUserRoles` method in `roleController` to handle errors while fetching user roles.
         * Ensures that errors are caught and the correct error message is returned with a status code of 500.
         */
        it('should handle errors when fetching user roles', async () => {
            const userId = 1;
            const req = httpMocks.createRequest({
                method: 'GET',
                url: `/user/${userId}/roles`,
                params: { userId }
            });
            const res = httpMocks.createResponse();

            db.user.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

            await roleController.getUserRoles(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Error fetching user roles', error: 'Database error' });
        });
    });
});
