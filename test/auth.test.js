/**
 * @file auth.test.js
 * @description This file contains comprehensive unit tests for the authentication controller functions of the application.
 * It ensures the proper functioning of various authentication-related operations, including login, signup, 
 * email verification, password reset, and logout functionalities. 
 * The tests cover different scenarios such as successful responses, missing or invalid inputs, 
 * user not found, password mismatch, and internal server errors, ensuring that the controller handles these scenarios as expected.
 *
 * The test cases are structured to mock dependencies like bcrypt, jwt, database models, 
 * and email services, allowing isolated and reliable testing of the controller logic.
 * 
 * Tests included:
 * - **login**: Tests user login functionality, including token generation, missing credentials, invalid username/password, and error handling.
 * - **signup**: Validates user registration, checking for existing users, password hashing, and sending verification emails.
 * - **resendVerificationEmail**: Ensures the functionality of resending verification emails to users who haven't verified their email.
 * - **verification**: Tests the email verification process using a JWT token, including invalid or expired tokens.
 * - **verifyUser**: Checks the endpoint that verifies if a user is authenticated based on the presence of a user object.
 * - **forgotPassword**: Tests sending password reset links and handling scenarios where the user is not found or server errors occur.
 * - **resetPassword**: Validates the password reset functionality, including token verification, password hashing, and error scenarios.
 * - **logout**: Tests the logout functionality by ensuring that the user session is invalidated correctly.
 */

require('dotenv').config();
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const sendVerificationEmail = require('../utils/emailService');
const authController = require('./../controllers/auth.controller');

// Mock the necessary modules
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models');
jest.mock('../utils/emailService');

/**
  * @description Unit tests for the login function of the auth controller.
  */
describe('Auth Controller', () => {

    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        /**
     * @description Should return a token on successful login.
     */
        it('should return a token on successful login', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', emailVerified: true };
            req.body = { username: 'testuser', password: 'password' };
            bcrypt.compare.mockResolvedValue(true);
            db.user.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('mocktoken');

            await authController.login(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ token: "mocktoken" });
        });

        /**
               * @description Should return 400 if username or password is missing.
        */
        it('should return 400 if username or password is missing', async () => {
            req.body = { username: '' };

            await authController.login(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: "Username and password are required" });
        });
        /**
              * @description Should return 401 if user is not found.
              */
        it('should return 401 if user is not found', async () => {
            req.body = { username: 'testuser', password: 'password' };
            db.user.findOne.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.statusCode).toBe(401);
            expect(JSON.parse(res._getData())).toEqual({ message: "Invalid username or password" });
        });
        /**
              * @description Should return 401 if password does not match.
              */
        it('should return 401 if password does not match', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
            req.body = { username: 'testuser', password: 'wrongpassword' };
            bcrypt.compare.mockResolvedValue(false);
            db.user.findOne.mockResolvedValue(mockUser);

            await authController.login(req, res);

            expect(res.statusCode).toBe(401);
            expect(JSON.parse(res._getData())).toEqual({ message: "Invalid username or password" });
        });
        /**
            * @description Should return 500 on server error during login.
            */
        it('should return 500 on server error', async () => {
            req.body = { username: 'testuser', password: 'password' };
            db.user.findOne.mockRejectedValue(new Error('Server error'));

            await authController.login(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: "Server error", "error": "Server error" });
        });
    });

    /**
   * @description Unit tests for the signup function of the auth controller.
   */
    describe('signup', () => {
        /**
       * @description Should register a new user and send verification email.
       */
        it('should register a new user and send verification email', async () => {
            const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
            req.body = { username: 'testuser', email: 'test@example.com', password: 'password' };
            db.user.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedpassword');
            db.user.create.mockResolvedValue(mockUser);
            db.user_roles.create.mockResolvedValue({});
            jwt.sign.mockReturnValue('mocktoken');
            sendVerificationEmail.mockResolvedValue(true);

            await authController.signup(req, res);

            expect(res.statusCode).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({ message: "User registered successfully. Please check your email to verify your account." });
        });
        /**
               * @description Should return 400 if user already exists.
               */
        it('should return 400 if user already exists', async () => {
            req.body = { username: 'testuser', email: 'test@example.com', password: 'password' };
            db.user.findOne.mockResolvedValue({ id: 1 });

            await authController.signup(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: "User already registered" });
        });
        /**
             * @description Should return 500 on server error during signup.
             */
        it('should return 500 on server error during signup', async () => {
            req.body = { username: 'testuser', email: 'test@example.com', password: 'password' };
            db.user.findOne.mockRejectedValue(new Error('Server error'));

            await authController.signup(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: "Internal server error", "error": "Server error" });
        });
    });
    /**
       * @description Unit tests for the resendVerificationEmail function of the auth controller.
       */
    describe('resendVerificationEmail', () => {
        /**
      * @description Should resend verification email successfully.
      */
        it('should resend verification email successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com', emailVerified: false };
            req.body = { email: 'test@example.com' };
            db.user.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('mocktoken');
            sendVerificationEmail.mockResolvedValue(true);

            await authController.resendVerificationEmail(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: "Verification email resent successfully" });
        });

        /**
             * @description Should return 404 if user is not found.
             */
        it('should return 404 if user is not found', async () => {
            req.body = { email: 'test@example.com' };
            db.user.findOne.mockResolvedValue(null);

            await authController.resendVerificationEmail(req, res);

            expect(res.statusCode).toBe(404);
            expect(JSON.parse(res._getData())).toEqual({ message: "User not found" });
        });
        /**
              * @description Should return 400 if user is already verified.
              */
        it('should return 400 if user is already verified', async () => {
            const mockUser = { id: 1, email: 'test@example.com', emailVerified: true };
            req.body = { email: 'test@example.com' };
            db.user.findOne.mockResolvedValue(mockUser);

            await authController.resendVerificationEmail(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: "User is already verified" });
        });

        /**
               * @description Should return 500 on server error during resend verification email.
               */
        it('should return 500 on server error during resend verification email', async () => {
            req.body = { email: 'test@example.com' };
            db.user.findOne.mockRejectedValue(new Error('Server error'));

            await authController.resendVerificationEmail(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: "Internal server error", "error": "Server error" });
        });
    });
    /**
       * @description Unit tests for the verification function of the auth controller.
       */
    describe('verification', () => {
        /**
     * @description Should verify user successfully.
     */
        it('should verify user successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com', emailVerified: false, save: jest.fn() };
            req.params = { token: 'validtoken' };
            jwt.verify.mockReturnValue({ id: 1, email: 'test@example.com' });
            db.user.findOne.mockResolvedValue(mockUser);

            await authController.verification(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'User verified successfully' });
            expect(mockUser.save).toHaveBeenCalled();
        });
        /**
            * @description Should return 400 for invalid or expired verification link.
            */
        it('should return 400 for invalid or expired verification link', async () => {
            req.params = { token: 'invalidtoken' };
            jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

            await authController.verification(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Invalid or expired verification link', error: 'Invalid token' });
        });
        /**
            * @description Should return 400 if user is not found during verification.
            */
        it('should return 400 for invalid verification link if user not found', async () => {
            req.params = { token: 'validtoken' };
            jwt.verify.mockReturnValue({ id: 1, email: 'test@example.com' });
            db.user.findOne.mockResolvedValue(null);

            await authController.verification(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: "Invalid verification link" });
        });
    });
    /**
     * @description Unit tests for the verifyUser function of the auth controller.
     */
    describe('verifyUser', () => {
        /**
   * @description Should return user authentication status.
   * This test simulates a scenario where the user is authenticated, 
   * and the `req.user` object is populated. 
   * It verifies that the `verifyUser` function returns a 200 status code 
   * with a message indicating that the user is authenticated.
   */
        it('should return user authentication status', () => {
            req.user = { id: 1 };

            authController.verifyUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'User is authenticated', user: req.user });
        });
    });
    /**
      * @description Unit tests for the forgotPassword function of the auth controller.
      */
    describe('forgotPassword', () => {
        /**
      * @description Should send reset password email successfully.
      */
        it('should send password reset link successfully', async () => {
            const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
            req.body = { email: 'test@example.com' };
            db.user.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('mocktoken');
            sendVerificationEmail.mockResolvedValue(true);

            await authController.forgotPassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Password reset link sent successfully' });
        });
        /**
              * @description Should return 404 if user is not found during forgotPassword.
              */
        it('should return 404 if user is not found', async () => {
            req.body = { email: 'test@example.com' };
            db.user.findOne.mockResolvedValue(null);

            await authController.forgotPassword(req, res);

            expect(res.statusCode).toBe(404);
            expect(JSON.parse(res._getData())).toEqual({ message: 'User not found' });
        });
        /**
                * @description Should return 500 on server error during forgotPassword.
                */
        it('should return 500 on server error during forgot password', async () => {
            req.body = { email: 'test@example.com' };
            db.user.findOne.mockRejectedValue(new Error('Server error'));

            await authController.forgotPassword(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Internal server error', error: 'Server error' });
        });
    });
    /**
      * @description Unit tests for the resetPassword function of the auth controller.
      */
    describe('resetPassword', () => {
        /**
    * @description Should reset password successfully.
    */
        it('should reset password successfully', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', save: jest.fn() };
            req.body = { token: 'validtoken', newPassword: 'newpassword' };
            jwt.verify.mockReturnValue({ id: 1, username: 'testuser' });
            db.user.findOne.mockResolvedValue(mockUser);
            bcrypt.hash.mockResolvedValue('newhashedpassword');

            await authController.resetPassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Password reset successfully' });
            expect(mockUser.save).toHaveBeenCalled();
        });
        /**
               * @description Should return 400 for invalid or expired reset token.
               */
        it('should return 400 for invalid or expired token', async () => {
            req.body = { token: 'invalidtoken', newPassword: 'newpassword' };
            jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

            await authController.resetPassword(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Invalid or expired token', error: 'Invalid token' });
        });
        /**
             * @description Should return 400 if user is not found during resetPassword.
             */
        it('should return 400 for invalid token if user not found', async () => {
            req.body = { token: 'validtoken', newPassword: 'newpassword' };
            jwt.verify.mockReturnValue({ id: 1, username: 'testuser' });
            db.user.findOne.mockResolvedValue(null);

            await authController.resetPassword(req, res);

            expect(res.statusCode).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Invalid or expired token' });
        });
    });
    /**
        * @description Unit tests for the logout function of the auth controller.
        */
    describe('logout', () => {
        /**
      * @description Should log out user successfully by clearing the token.
      */
        it('should log out successfully', async () => {
            req.user = { id: 1 };
            req.headers.authorization = 'Bearer mocktoken';
            db.session.update.mockResolvedValue([1]);

            await authController.logout(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Logged out successfully' });
        });
        /**
             * @description Should return 500 on server error during logout.
             */
        it('should return 500 on server error during logout', async () => {
            req.user = { id: 1 };
            req.headers.authorization = 'Bearer mocktoken';
            db.session.update.mockRejectedValue(new Error('Server error'));

            await authController.logout(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Server error', error: 'Server error' });
        });
    });
});
