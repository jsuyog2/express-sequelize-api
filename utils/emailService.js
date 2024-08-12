/**
 * @file emailService.js
 * @description This file contains the logic for sending emails using Nodemailer.
 * It exports a function to send account verification emails to users.
 * 
 * Nodemailer is configured with settings from the `mail.config.js` file, including
 * SMTP server details and authentication credentials. The `sendVerificationEmail` function
 * sends an email with a verification link to the provided recipient email address.
 * 
 * The configuration includes:
 * - SMTP server `host` and `port`
 * - Authentication details (`username` and `password`)
 * 
 * The `sendVerificationEmail` function creates an email message with a subject and
 * body containing the verification link and attempts to send it using the configured
 * transporter.
 * 
 * @module email.service
 * @requires nodemailer
 * @requires ../config/mail.config
 * 
 * @example
 * const sendVerificationEmail = require('./path/to/email.service');
 * sendVerificationEmail('user@example.com', 'http://example.com/verify?token=123456');
 */

const nodemailer = require('nodemailer');
const mail_config = require('../config/mail.config'); // Configuration file containing email settings

/**
 * Sends a verification email to the specified address with a verification link.
 * 
 * @function
 * @param {string} email - The recipient's email address.
 * @param {string} link - The verification link to be included in the email body.
 * 
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 * 
 * @throws {Error} If there is an issue sending the email, an error is thrown.
 */
const sendVerificationEmail = async (email, link) => {
    // Create a Nodemailer transporter using SMTP settings from the configuration
    const transporter = nodemailer.createTransport({
        host: mail_config.host,
        port: mail_config.port,
        secure: true, // Use TLS
        auth: {
            user: mail_config.username,
            pass: mail_config.password
        }
    });

    const mailOptions = {
        from: mail_config.username,
        to: email,
        subject: 'Account Verification',
        text: `Click the link to verify your account: ${link}`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error; // Re-throw the error to be caught in the test
    }
};

module.exports = sendVerificationEmail;
