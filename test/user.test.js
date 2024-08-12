/**
 * @file user.test.js
 * @description This file contains unit tests for the `userController` module, specifically testing the functionalities of retrieving user details, updating user information, and changing passwords.
 * The tests ensure that the controller methods handle requests and responses correctly, including various scenarios such as successful operations and error conditions. 
 * The file utilizes `node-mocks-http` to simulate HTTP requests and responses and `jest` for mocking dependencies and assertions.
 *
 * The tests are organized into the following sections:
 * 
 * - **GET /user**: Tests for retrieving user details.
 *   - **Success**: Verifies that user details are retrieved successfully and returned in the correct format.
 *   - **User Not Found**: Checks that the appropriate error message is returned when the user is not found.
 *   - **Error**: Validates that server errors are handled properly and an appropriate error message is returned.
 *
 * - **PUT /user**: Tests for updating user details.
 *   - **Success**: Ensures that user details are updated successfully and the correct response is returned.
 *   - **User Not Found**: Verifies that the correct error message is returned when the user to be updated is not found.
 *   - **Error**: Confirms that errors during the update operation are handled properly and the appropriate error message is returned.
 *
 * - **POST /user/change-password**: Tests for changing the user's password.
 *   - **Success**: Ensures that the password is changed successfully and the correct success message is returned.
 *   - **User Not Found**: Checks that the correct error message is returned when the user is not found.
 *   - **Current Password Incorrect**: Validates that the correct error message is returned if the current password is incorrect.
 *   - **Error**: Verifies that errors during the password change operation are handled properly and an appropriate error message is returned.
 */

require('dotenv').config();
const userController = require('../controllers/user.controller');
const db = require('../models');
const bcrypt = require('bcrypt');
const httpMocks = require('node-mocks-http');

describe('User Controller', () => {
    let userMock;

    /**
     * Setup mock user data and clear all mocks before each test.
     */
    beforeEach(() => {
        userMock = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            phoneNumber: '1234567890',
            password: bcrypt.hashSync('password123', 10),
            save: jest.fn().mockResolvedValue(true),
            toJSON: () => ({
                id: 1,
                username: userMock.username,
                email: userMock.email,
                name: userMock.name,
                phoneNumber: userMock.phoneNumber
            })
        };

        jest.clearAllMocks();
    });

    describe('GET /user', () => {
        /**
         * @function
         * @description Tests the `getUser` method in `userController` to ensure it retrieves user details successfully.
         * Verifies that the status code is 200 and the response contains the correct user data.
         */
        it('should retrieve user details successfully', async () => {
            db.user.findByPk = jest.fn().mockResolvedValue(userMock);

            const req = httpMocks.createRequest({
                method: 'GET',
                url: '/user',
                headers: { Authorization: 'Bearer validtoken' },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            await userController.getUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                name: 'Test User',
                phoneNumber: '1234567890'
            });
        });

        /**
         * @function
         * @description Tests the `getUser` method in `userController` to handle cases where the user is not found.
         * Ensures that the correct error message is returned with a status code of 404.
         */
        it('should return 404 if user not found', async () => {
            db.user.findByPk = jest.fn().mockResolvedValue(null);

            const req = httpMocks.createRequest({
                method: 'GET',
                url: '/user',
                headers: { Authorization: 'Bearer validtoken' },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            await userController.getUser(req, res);

            expect(res.statusCode).toBe(404);
            expect(JSON.parse(res._getData())).toEqual({ message: 'User not found' });
        });

        /**
         * @function
         * @description Tests the `getUser` method in `userController` to handle server errors.
         * Ensures that errors are caught and the correct error message is returned with a status code of 500.
         */
        it('should handle server errors', async () => {
            db.user.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

            const req = httpMocks.createRequest({
                method: 'GET',
                url: '/user',
                headers: { Authorization: 'Bearer validtoken' },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            await userController.getUser(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Internal server error', error: 'Database error' });
        });
    });

    describe('PUT /user', () => {
        /**
         * @function
         * @description Tests the `updateUser` method in `userController` to ensure it updates user details successfully.
         * Verifies that the status code is 200 and the response contains the updated user data.
         */
        it('should update user details successfully', async () => {
            db.user.findByPk = jest.fn().mockResolvedValue(userMock);

            const updatedUser = { username: 'newusername', email: 'newemail@example.com' };
            const req = httpMocks.createRequest({
                method: 'PUT',
                url: '/user',
                headers: { Authorization: 'Bearer validtoken' },
                body: updatedUser,
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            await userController.updateUser(req, res);

            expect(userMock.username).toBe('newusername');
            expect(userMock.email).toBe('newemail@example.com');
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                id: 1,
                username: 'newusername',
                email: 'newemail@example.com',
                name: 'Test User',
                phoneNumber: '1234567890'
            });
        });

        /**
         * @function
         * @description Tests the `updateUser` method in `userController` to ensure other user details can be updated successfully.
         * Verifies that the status code is 200 and the response contains the updated user data.
         */
        it('should update other user details successfully', async () => {
            db.user.findByPk = jest.fn().mockResolvedValue(userMock);

            const updatedUser = { name: 'New Test User', phoneNumber: '9876543210' };
            const req = httpMocks.createRequest({
                method: 'PUT',
                url: '/user',
                headers: { Authorization: 'Bearer validtoken' },
                body: updatedUser,
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            await userController.updateUser(req, res);

            expect(userMock.name).toBe('New Test User');
            expect(userMock.phoneNumber).toBe('9876543210');
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                name: 'New Test User',
                phoneNumber: '9876543210'
            });
        });

        /**
         * @function
         * @description Tests the `updateUser` method in `userController` to handle cases where the user is not found.
         * Ensures that the correct error message is returned with a status code of 404.
         */
        it('should return 404 if user not found when updating user', async () => {
            db.user.findByPk = jest.fn().mockResolvedValue(null);

            const req = httpMocks.createRequest({
                method: 'PUT',
                url: '/user',
                headers: { Authorization: 'Bearer validtoken' },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            await userController.updateUser(req, res);

            expect(res.statusCode).toBe(404);
            expect(JSON.parse(res._getData())).toEqual({ message: 'User not found' });
        });

        /**
         * @function
         * @description Tests the `updateUser` method in `userController` to handle server errors during the update operation.
         * Ensures that errors are caught and the correct error message is returned with a status code of 500.
         */
        it('should handle server errors when updating user', async () => {
            db.user.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

            const updatedUser = { username: 'newusername' };
            const req = httpMocks.createRequest({
                method: 'PUT',
                url: '/user',
                headers: { Authorization: 'Bearer validtoken' },
                body: updatedUser,
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            await userController.updateUser(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Internal server error', error: 'Database error' });
        });
    });

    describe('POST /user/change-password', () => {
        /**
         * @function
         * @description Tests the `changePassword` method in `userController` to ensure it changes the user's password successfully.
         * Verifies that the status code is 200 and the response contains a success message.
         */
        it('should change the password successfully', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/user/change-password',
                headers: { Authorization: 'Bearer validtoken' },
                body: {
                    currentPassword: 'password123',
                    newPassword: 'newpassword456'
                },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            db.user.findByPk = jest.fn().mockResolvedValue(userMock);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            bcrypt.hash = jest.fn().mockResolvedValue('newhashedpassword');

            await userController.changePassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Password changed successfully' });
        });

        /**
         * @function
         * @description Tests the `changePassword` method in `userController` to handle cases where the current password is incorrect.
         * Ensures that the correct error message is returned with a status code of 400.
         */
        it('should return 400 if the current password is incorrect', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/user/change-password',
                headers: { Authorization: 'Bearer validtoken' },
                body: {
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword456'
                },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            db.user.findByPk = jest.fn().mockResolvedValue(userMock);
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            await userController.changePassword(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Current password is incorrect' });
        });

        /**
         * @function
         * @description Tests the `changePassword` method in `userController` to handle cases where the user is not found.
         * Ensures that the correct error message is returned with a status code of 404.
         */
        it('should return 404 if user not found when changing password', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/user/change-password',
                headers: { Authorization: 'Bearer validtoken' },
                body: {
                    currentPassword: 'password123',
                    newPassword: 'newpassword456'
                },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            db.user.findByPk = jest.fn().mockResolvedValue(null);

            await userController.changePassword(req, res);

            expect(res.statusCode).toBe(404);
            expect(JSON.parse(res._getData())).toEqual({ message: 'User not found' });
        });

        /**
         * @function
         * @description Tests the `changePassword` method in `userController` to handle server errors during the password change operation.
         * Ensures that errors are caught and the correct error message is returned with a status code of 500.
         */
        it('should handle server errors when changing password', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/user/change-password',
                headers: { Authorization: 'Bearer validtoken' },
                body: {
                    currentPassword: 'password123',
                    newPassword: 'newpassword456'
                },
                user: { id: 1 }
            });
            const res = httpMocks.createResponse();

            db.user.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

            await userController.changePassword(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Internal server error', error: 'Database error' });
        });
    });
});
