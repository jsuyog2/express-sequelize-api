/**
 * @file middlewares.test.js
 * @description This file contains comprehensive unit tests for various middleware functions used in the application.
 * These middleware functions play crucial roles in the request lifecycle, including token verification, request logging, 
 * role-based access control, and validation error handling. 
 * 
 * The tests are designed to ensure that each middleware function behaves as expected across different scenarios,
 * such as missing or invalid tokens, logging failures, role mismatches, and validation errors. 
 * By isolating and mocking dependencies like JWT, database models, and request/response objects, 
 * the tests provide reliable and thorough coverage of middleware logic.
 * 
 * Tests included:
 * - **verifyToken**: Tests the JWT token verification process, covering scenarios like missing tokens, invalid tokens, blacklisted tokens, and successful verification.
 * - **logger**: Ensures that request details are logged correctly to the database, and gracefully handles logging failures.
 * - **roleAuthorization**: Verifies that access is granted or denied based on user roles, handling scenarios with missing or mismatched roles.
 * - **validationErrorHandler**: Tests the handling of validation errors from express-validator, ensuring appropriate error responses and control flow.
 */


require('dotenv').config();
const fs = require('fs');
const httpMocks = require('node-mocks-http');
const { validationResult } = require('express-validator');
const { verifyToken, logger, roleAuthorization, validationErrorHandler } = require('../middlewares'); // Adjust the path as needed
const jwt = require('jsonwebtoken');
const db = require('../models');

jest.mock('../models');
jest.mock('express-validator');

/**
 * @description Unit tests for the verifyToken middleware function.
 *              This middleware verifies JWT tokens, checks for token validity, blacklist status, and associated user information.
 */
describe('verifyToken Middleware', () => {
    let req, res, next;
    const orignalFs = fs.readFileSync
    beforeEach(() => {
        const mockPublicKey = 'mockPublicKeyContent';
        fs.readFileSync = jest.fn().mockResolvedValue(mockPublicKey)
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
    });

    afterEach(() => {
        fs.readFileSync = orignalFs;
    })

    /**
     * @description Test case for handling scenario where no token is provided in the request.
     *              The middleware should return a 401 status with an appropriate message.
     */
    it('should return 401 if no token is provided', (done) => {
        req.headers.authorization = ''; // No token provided

        verifyToken(req, res, next);

        setTimeout(() => {
            expect(res.statusCode).toBe(401);
            expect(res._getData()).toEqual(JSON.stringify({ message: 'No token provided' }));
            done();
        }, 0);
    });

    /**
     * @description Test case for handling scenario where an invalid token is provided.
     *              The middleware should return a 401 status with an appropriate message.
     */
    it('should return 401 if the token is invalid', (done) => {
        req.headers.authorization = 'Bearer invalidtoken';

        jwt.verify = jest.fn((token, publicKey, options, callback) => {
            callback(new Error('Invalid token'), null);
        });

        verifyToken(req, res, next);

        setTimeout(() => {
            expect(res.statusCode).toBe(401);
            expect(res._getData()).toEqual(JSON.stringify({ message: 'Invalid token' }));
            done();
        }, 0);
    });

    /**
     * @description Test case for handling scenario where a valid token is missing required user information.
     *              The middleware should return a 401 status with an appropriate message.
     */
    it('should return 401 if the token is missing required user information', (done) => {
        const mockToken = 'validtoken';
        req.headers.authorization = `Bearer ${mockToken}`;

        jwt.verify = jest.fn((token, publicKey, options, callback) => {
            callback(null, {});
        });

        verifyToken(req, res, next);

        setTimeout(() => {
            expect(res.statusCode).toBe(401);
            expect(res._getData()).toEqual(JSON.stringify({ message: 'Token is missing required user information' }));
            done();
        }, 0);
    });

    /**
     * @description Test case for handling scenario where a valid token is blacklisted.
     *              The middleware should return a 401 status with an appropriate message.
     */
    it('should return 401 if the token is blacklisted', (done) => {
        const mockToken = 'validtoken';
        req.headers.authorization = `Bearer ${mockToken}`;

        jwt.verify = jest.fn((token, publicKey, options, callback) => {
            callback(null, { id: 1, username: 'testuser' });
        });

        db.session.findOne = jest.fn().mockResolvedValue({ flag: true });

        verifyToken(req, res, next);

        setTimeout(() => {
            expect(res.statusCode).toBe(401);
            expect(res._getData()).toEqual(JSON.stringify({ message: 'Token is blacklisted' }));
            done();
        }, 0);
    });

    /**
     * @description Test case for handling scenario where the user associated with the token is not found in the database.
     *              The middleware should return a 401 status with an appropriate message.
     */
    it('should return 401 if the user is not found', (done) => {
        const mockToken = 'validtoken';
        req.headers.authorization = `Bearer ${mockToken}`;

        jwt.verify = jest.fn((token, publicKey, options, callback) => {
            callback(null, { id: 1, username: 'testuser' });
        });

        db.session.findOne = jest.fn().mockResolvedValue({ flag: false });

        db.user.findOne = jest.fn().mockResolvedValue(null); // User not found

        verifyToken(req, res, next);

        setTimeout(() => {
            expect(res.statusCode).toBe(401);
            expect(res._getData()).toEqual(JSON.stringify({ message: 'User not found' }));
            done();
        }, 0);
    });

    /**
     * @description Test case for successful token verification.
     *              The middleware should attach user information to req and call next().
     */
    it('should attach user info to req and call next() if the token is valid and user is found', (done) => {
        const mockToken = 'validtoken';
        req.headers.authorization = `Bearer ${mockToken}`;

        jwt.verify = jest.fn((token, publicKey, options, callback) => {
            callback(null, { id: 1, username: 'testuser' });
        });

        db.session.findOne = jest.fn().mockResolvedValue({ flag: false });

        db.user.findOne = jest.fn().mockResolvedValue({
            id: 1,
            username: 'testuser',
            emailVerified: true,
            Roles: [{ roleName: 'admin' }]
        });

        verifyToken(req, res, next);

        setTimeout(() => {
            expect(next).toHaveBeenCalled(); // Ensure next() was called
            expect(req.user).toEqual({
                id: 1,
                username: 'testuser',
                verified: true,
                role: ['admin']
            });
            done();
        }, 0);
    });

    /**
     * @description Test case for handling unexpected errors during token verification.
     *              The middleware should return a 401 status with an appropriate message.
     */
    it('should handle token verification failure gracefully', (done) => {
        const mockToken = 'validtoken';
        req.headers.authorization = `Bearer ${mockToken}`;

        const mockError = new Error('Token is invalid');

        jwt.verify = jest.fn((token, publicKey, options, callback) => {
            callback(null, { id: 1, username: 'testuser' });
        });
        db.session.findOne.mockRejectedValue(mockError);

        verifyToken(req, res, next);
        setTimeout(() => {
            expect(res.statusCode).toBe(401);
            expect(res._getData()).toEqual(JSON.stringify({ message: 'Token verification failed', error: 'Token is invalid' }));
            expect(next).not.toHaveBeenCalled();
            done();
        }, 0);
    });
});

/**
 * @description Unit tests for the logger middleware function.
 *              This middleware logs request details to the database and handles logging failures.
 */
describe('logger Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/test-url',
            user: { id: 1 }
        });
        res = httpMocks.createResponse();
        next = jest.fn();
    });

    /**
     * @description Test case for logging request details to the database.
     */
    it('should log the request details to the database', (done) => {
        res = {
            on: jest.fn().mockImplementationOnce((event, handler) => {
                handler();
            }),
        }
        db.log.create = jest.fn().mockResolvedValue(true);

        logger(req, res, next);

        expect(db.log.create).toHaveBeenCalledWith({
            level: 'info',
            message: expect.stringContaining('GET /test-url'),
            userId: 1
        });
        done();
    });

    /**
     * @description Test case for handling logging failure.
     *              The middleware should log an error message to the console.
     */
    it('should handle logging failure gracefully', (done) => {
        const mockError = new Error('Database error');
        res = {
            on: jest.fn().mockImplementationOnce((event, handler) => {
                handler();
            }),
        }
        db.log.create.mockRejectedValue(mockError);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        logger(req, res, next);
        setTimeout(() => {
            expect(db.log.create).toHaveBeenCalledWith({
                level: 'info',
                message: expect.stringContaining('GET /test-url'),
                userId: 1
            });
            expect(console.error).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith('Failed to log request:', mockError);
            consoleSpy.mockRestore();
            done();
        }, 0)
    });

    /**
     * @description Test case for logging request details when req.user is not defined.
     */
    it('should log the request with null userId if req.user is not defined', (done) => {
        req.user = undefined;

        res = {
            on: jest.fn().mockImplementationOnce((event, handler) => {
                handler();
            }),
        }

        db.log.create.mockResolvedValue(true);

        logger(req, res, next);
        setTimeout(() => {
            expect(db.log.create).toHaveBeenCalledWith({
                level: 'info',
                message: expect.stringContaining('GET /test-url'),
                userId: null
            });
            done();
        }, 0)
    });
});

/**
 * @description Unit tests for the roleAuthorization middleware function.
 *              This middleware checks if the user has the required role(s) to access certain resources.
 */
describe('roleAuthorization Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest({
            user: { role: ['admin'] }
        });
        res = httpMocks.createResponse();
        next = jest.fn();
    });

    /**
     * @description Test case for allowing access when the user has the required role.
     *              The middleware should call next() to allow the request to proceed.
     */
    it('should allow access if the user has the required role', () => {
        roleAuthorization(['admin'])(req, res, next);

        expect(next).toHaveBeenCalled(); // Ensure next() was called
    });

    /**
     * @description Test case for denying access when the user does not have the required role.
     *              The middleware should return a 403 status with an appropriate message.
     */
    it('should deny access if the user does not have the required role', () => {
        req.user.role = ['user']; // User has a different role

        roleAuthorization(['admin'])(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res._getData()).toEqual(JSON.stringify({ message: 'Forbidden: Insufficient permissions' }));
        expect(next).not.toHaveBeenCalled();
    });

    /**
     * @description Test case for denying access when no roles are defined in req.user.
     *              The middleware should return a 403 status with an appropriate message.
     */
    it('should deny access if req.user.role is undefined or empty', () => {
        req.user.role = undefined; // No roles defined

        roleAuthorization(['admin'])(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res._getData()).toEqual(JSON.stringify({ message: 'Access denied' }));
        expect(next).not.toHaveBeenCalled();
    });
});

/**
 * @description Unit tests for the validationErrorHandler middleware function.
 *              This middleware handles validation errors from express-validator and returns appropriate responses.
 */
describe('validationErrorHandler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
    });

    /**
     * @description Test case for handling validation errors.
     *              The middleware should return a 400 status with the error details.
     */
    it('should return 400 if validation errors are present', () => {
        validationResult.mockImplementationOnce(() => ({
            isEmpty: () => false,
            array: () => [{ msg: 'Error message', param: 'field' }]
        }));

        validationErrorHandler(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res._getData()).toEqual(JSON.stringify({
            errors: [{ msg: 'Error message', param: 'field' }]
        }));
        expect(next).not.toHaveBeenCalled();
    });

    /**
     * @description Test case for passing control to the next middleware if no validation errors are present.
     */
    it('should call next() if no validation errors are present', () => {
        validationResult.mockImplementationOnce(() => ({
            isEmpty: () => true
        }));

        validationErrorHandler(req, res, next);

        expect(next).toHaveBeenCalled(); // Ensure next() was called
    });
});
