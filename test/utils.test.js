/**
 * @file utils.test.js
 * @description This file contains unit tests for the emailService module, specifically the `sendVerificationEmail` function.
 * The `sendVerificationEmail` function is responsible for sending verification emails to users. The tests ensure that the function correctly sends emails and handles errors using a mocked transporter.
 * The file uses `nodemailer-mock` to simulate email sending and `jest` for testing.
 * 
 * The tests include:
 * - **Sending Verification Email**: Verifies that the email is sent successfully with the correct recipient, subject, and content.
 * - **Handling Email Sending Errors**: Ensures that the function correctly handles and rejects errors that occur during email sending.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const { mock, createTransport } = require('nodemailer-mock').getMockFor(nodemailer);

const sendVerificationEmail = require('../utils/emailService');

// Create a mock transporter using nodemailer-mock
const mockTransporter = createTransport({
    host: 'mock.host',
    port: 587,
    secure: true, // Use TLS
    auth: {
        user: 'mock@example.com',
        pass: 'password'
    }
});

// Temporarily override console methods to suppress output during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    mock.reset(); // Reset mock after each test to avoid interference
});

describe('sendVerificationEmail', () => {
    /**
     * @function
     * @description Tests that the `sendVerificationEmail` function sends an email successfully with the correct details.
     * Asserts that the email is sent with the expected recipient, subject, and content.
     */
    it('should send a verification email successfully', async () => {
        const email = 'jsuyog2@gmail.com';
        const link = 'http://example.com/verify?token=123456';

        const originalTransporter = nodemailer.createTransport;
        nodemailer.createTransport = () => mockTransporter;

        // Call the function with the mocked transporter
        await sendVerificationEmail(email, link);

        // Get the sent emails
        const sentMail = mock.getSentMail();
        expect(sentMail).toHaveLength(1);
        expect(sentMail[0].to).toBe(email);
        expect(sentMail[0].subject).toBe('Account Verification');
        expect(sentMail[0].text).toContain(link);

        nodemailer.createTransport = originalTransporter;
    });

    /**
     * @function
     * @description Tests that the `sendVerificationEmail` function handles errors correctly when sending an email fails.
     * Asserts that the function rejects with the expected error message.
     */
    it('should handle errors when sending email', async () => {
        // Force an error in the mock transporter
        const errorTransporter = {
            sendMail: jest.fn(() => Promise.reject(new Error('Test Error')))
        };

        // Temporarily override the transporter in the sendVerificationEmail function
        const originalTransporter = nodemailer.createTransport;
        nodemailer.createTransport = () => errorTransporter;

        const email = 'test@example.com';
        const link = 'http://example.com/verify?token=123456';

        // Ensure that the promise rejects with the expected error
        await expect(sendVerificationEmail(email, link)).rejects.toThrow('Test Error');

        // Restore the original transporter
        nodemailer.createTransport = originalTransporter;
    });
});
