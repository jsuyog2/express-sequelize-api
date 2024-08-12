/**
 * @file config.js
 * @description This file exports configuration settings for the application.
 * It includes environment-specific variables such as the CORS allow list, base URL, and production flag.
 * The settings are sourced from environment variables to facilitate different configurations for development, testing, and production environments.
 * 
 * @constant {string[]} corsAllowList - An array of allowed origins for CORS requests.
 * @constant {string} baseUrl - The base URL of the application, used for generating full URLs in responses and requests.
 * @constant {string} PRODUCTION - A flag indicating whether the application is running in production mode.
 */
const {
    CORS_LIST, BASE_URL, PRODUCTION
} = process.env;

module.exports = {
    PRODUCTION: PRODUCTION,
    corsAllowList: CORS_LIST,
    baseUrl: BASE_URL
};
