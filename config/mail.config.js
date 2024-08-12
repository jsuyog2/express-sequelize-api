/**
 * @file mail.config.js
 * @description This file exports the configuration settings for the mail service.
 * It includes the mail server's host, port, username, and password, all sourced from environment variables.
 * This configuration is used for setting up and authenticating the mail service for sending emails.
 * 
 * @constant {string} host - The hostname or IP address of the mail server.
 * @constant {number} port - The port number used by the mail server.
 * @constant {string} username - The username for authenticating with the mail server.
 * @constant {string} password - The password for authenticating with the mail server.
 */
const {
    MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD
} = process.env;

module.exports = {
    host: MAIL_HOST,
    port: MAIL_PORT,
    username: MAIL_USERNAME,
    password: MAIL_PASSWORD,
};
