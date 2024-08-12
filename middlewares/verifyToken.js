/**
 * @file verifyToken.js
 * @description This file contains middleware for verifying JWT tokens in incoming requests.
 * It checks the validity of the token using a public key and ensures the token is not blacklisted.
 * The middleware also verifies that the token contains required user information and
 * attaches user details to the request object if the token is valid.
 * 
 * The middleware performs the following actions:
 * - Extracts the token from the `Authorization` header, assuming a `Bearer` token format.
 * - Verifies the token using the public key and the RS256 algorithm.
 * - Checks if the token is blacklisted in the database.
 * - Ensures the token includes required user information and validates the user's existence.
 * - Attaches user information and roles to the request object for further use in the application.
 * 
 * The verification process includes:
 * - Reading the public key from a file
 * - Decoding the JWT and verifying its authenticity
 * - Querying the database for blacklisted tokens and user details
 * 
 * @module verifyToken
 * @requires fs
 * @requires path
 * @requires jsonwebtoken
 * @requires ../config/jwt.config
 * @requires ../models
 * 
 * @example
 * const verifyToken = require('./path/to/verifyToken');
 * app.use(verifyToken);
 */

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const jwt_config = require('./../config/jwt.config');
const db = require('../models');



/**
 * Middleware function to verify JWT tokens.
 * 
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {void} Passes control to the next middleware if the token is valid; otherwise, sends an error response.
 * 
 * @throws {Error} If token verification fails or other issues occur, an error response is sent.
 */
const verifyToken = async (req, res, next) => {
    // Extract the token from headers
    const token = req.headers['authorization']?.split(' ')[1]; // Assumes the token is sent as 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Load public key
    const publicKeyPath = path.resolve(jwt_config.publicKeyPath);
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

    // Verify the token using the public key
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Ensure decoded contains all necessary values
        if (!decoded.id || !decoded.username) {
            return res.status(401).json({ message: 'Token is missing required user information' });
        }
        try {
            const blacklistedToken = await db.session.findOne({ where: { token } });
            if (!blacklistedToken || blacklistedToken?.flag === true) {
                return res.status(401).json({ message: 'Token is blacklisted' });
            }

            // Find user by ID and username
            const user = await db.user.findOne({ where: { id: decoded.id, username: decoded.username }, include: [db.role] });
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const roles = user.Roles?.map((val) => val.roleName);

            // Attach user data to request object
            req.user = {
                id: user.id,
                username: user.username,
                verified: user.emailVerified,
                role: roles
                // Add other user fields as necessary
            };

            next();
        } catch (error) {
            res.status(401).json({ message: 'Token verification failed', error: error.message });
        }
    });

};

module.exports = verifyToken;
