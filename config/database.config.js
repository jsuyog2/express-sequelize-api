/**
 * @file database.config.js
 * @description This file exports the configuration settings for connecting to the PostgreSQL database.
 * It includes the database connection string sourced from environment variables.
 * This configuration is used to establish a connection to the database, allowing the application to interact with it.
 * 
 * @constant {string} connectionString - The connection string for PostgreSQL, used to connect to the database.
 */
const {
    PG_CONNECT
} = process.env;

module.exports = {
    connectionString: PG_CONNECT
};
