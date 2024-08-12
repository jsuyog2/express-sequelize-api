/**
 * @file auth.controller.js
 * @description This file contains the controller functions for handling user authentication and authorization.
 * It includes functionality for user login, signup, email verification, password reset, and user logout.
 * JSON Web Tokens (JWT) are utilized for securing authentication and maintaining valid user sessions.
 * The controller manages user authentication by verifying email addresses, generating tokens, and encrypting passwords.
 * It also handles sending verification and password reset emails, and manages user sessions with a database for token blacklisting and logout.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const jwt_config = require('./../config/jwt.config');
const config = require('./../config/config');
const sendVerificationEmail = require('../utils/emailService');



/**
 * @function login
 * @description Authenticates a user by verifying the provided username and password.
 * A JWT token is generated upon successful authentication. The token is used for securing subsequent requests.
 * The user's password is compared with the hashed password stored in the database.
 * The token is stored in the database for session management.
 * @param {Object} req - The request object (contains username and password).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user by username
        const user = await db.user.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Load private key for signing JWT
        const privateKeyPath = path.resolve(jwt_config.privateKeyPath);
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, verified: user.emailVerified },
            privateKey,
            { algorithm: 'RS256', expiresIn: '1h' }
        );
        await db.session.create({
            token: token,
            flag: false,
            userId: user.id
        });
        req.user = { id: user.id };
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @function signup
 * @description Registers a new user by creating an account with provided username, email, and password.
 * The password is hashed before storing it in the database. A verification token is generated and sent to the user's email.
 * If in a non-production environment, the verification token is returned directly.
 * @param {Object} req - The request object (contains username, email, and password).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await db.user.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await db.user.create({
            username,
            email,
            password: hashedPassword,
            emailVerified: false,
            acceptedTerms: true
        });
        await db.user_roles.create({ userId: newUser.id, roleId: 1 });
        req.user = { id: newUser.id };
        // Generate verification token
        const verificationToken = jwt.sign({ id: newUser.id, email: newUser.email }, jwt_config.secret, { expiresIn: '1h' });
        const verificationLink = `${config.baseUrl}/verification/${verificationToken}`;
        // Send verification email
        await sendVerificationEmail(email, verificationLink);

        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * @function resendVerificationEmail
 * @description Resends the verification email to the user if they have not yet verified their email address.
 * A new verification token is generated and sent to the user's email.
 * If in a non-production environment, the verification token is returned directly.
 * @param {Object} req - The request object (contains email of the user).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await db.user.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is already verified
        if (user.emailVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }
        req.user = { id: user.id };

        // Generate verification token
        const verificationToken = jwt.sign({ id: user.id, email: user.email }, jwt_config.secret, { expiresIn: '1h' });

        // Generate verification link
        const verificationLink = `${config.baseUrl}/verification/${verificationToken}`;

        // Send verification email
        await sendVerificationEmail(email, verificationLink);

        res.status(200).json({ message: 'Verification email resent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * @function verification
 * @description Verifies a user's email address using a verification token.
 * The token is decoded and the user's email verification status is updated in the database.
 * If the token is invalid or expired, an error response is returned.
 * @param {Object} req - The request object (contains verification token in the URL parameters).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.verification = async (req, res) => {
    const { token } = req.params;

    try {
        // Verify token
        const decoded = jwt.verify(token, jwt_config.secret);

        // Find user
        const user = await db.user.findOne({ where: { id: decoded.id, email: decoded.email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification link' });
        }

        // Update user as verified
        user.emailVerified = true;
        await user.save();

        res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired verification link', error: error.message });
    }
};

/**
 * @function verifyUser
 * @description Confirms that the user is authenticated. This is usually used to check the validity of the user's session.
 * The user's authentication status is returned in the response.
 * @param {Object} req - The request object (contains user information from the authentication middleware).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.verifyUser = (req, res) => {
    res.status(200).json({ message: 'User is authenticated', user: req.user });
};

/**
 * @function forgotPassword
 * @description Initiates the password reset process by sending a password reset link to the user's email.
 * A token is generated and sent via email to allow the user to reset their password.
 * If in a non-production environment, the token is returned directly.
 * @param {Object} req - The request object (contains email of the user).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await db.user.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, jwt_config.secret, { expiresIn: '1h' });

        const resetLink = `${config.baseUrl}/reset-password/${token}`;
        await sendVerificationEmail(user.email, 'Password Reset', `Please use the following link to reset your password: ${resetLink}`);

        res.status(200).json({ message: 'Password reset link sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * @function resetPassword
 * @description Resets the user's password using a password reset token.
 * The token is verified and the new password is hashed and saved in the database.
 * If the token is invalid or expired, an error response is returned.
 * @param {Object} req - The request object (contains reset token and new password).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, jwt_config.secret);

        const user = await db.user.findOne({ where: { id: decoded.id, username: decoded.username } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token', error: error.message });
    }
};

/**
 * @function logout
 * @description Logs out the current user by invalidating their session.
 * The token is removed from the database to prevent further use.
 * @param {Object} req - The request object (contains user information and token from the authentication middleware).
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.logout = async (req, res) => {
    try {
        const userId = req.user.id;
        const token = req.headers.authorization.split(' ')[1];
        await db.session.update({ flag: true }, { where: { token: token, userId: userId } });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
