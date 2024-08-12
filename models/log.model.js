/**
 * @file log.model.js
 * @description This file defines the Sequelize model for the Log entity.
 * 
 * The Log model is used to store log entries, including details such as the log level, message, and timestamp.
 * It also optionally references the User model to associate logs with specific users.
 * 
 * The attributes of the Log model are as follows:
 * 
 * - `level`: A string indicating the severity of the log (e.g., INFO, WARN, ERROR). This field is required.
 * - `message`: A text field containing the log message. This field is required.
 * - `timestamp`: A date field recording when the log entry was created. Defaults to the current time.
 * - `userId`: An optional integer field that references the ID of a user associated with the log entry. It is set to NULL if the related user is deleted.
 * 
 * @module models/log
 */

module.exports = (sequelize, Sequelize) => {
    const Log = sequelize.define("Log", {
        // Define the attributes for the Log model
        level: {
            type: Sequelize.STRING,
            allowNull: false, // Log level is required (e.g., INFO, WARN, ERROR)
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: false // Log message is required
        },
        timestamp: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW // Default to the current time
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Users', // Reference to the User model, if applicable
                key: 'id'
            },
            onDelete: 'SET NULL' // Set to NULL if the related user is deleted
        }
    });

    return Log;
};
