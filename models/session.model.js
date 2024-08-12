/**
 * @file session.model.js
 * @description This file defines the Sequelize model for the Session entity.
 * 
 * The Session model is used to represent user sessions within the application. It includes attributes for session tokens, flags, expiration dates, and associated users.
 * 
 * The attributes of the Session model are as follows:
 * 
 * - `token`: A unique text field that represents the session token. This field is required and must be unique.
 * - `flag`: A boolean field indicating whether the session is active or not. The default value is `false`.
 * - `expiresAt`: A date field specifying when the session expires. This field is optional.
 * - `userId`: An integer field representing the ID of the user associated with the session. This field is optional and references the `Users` model. If the related user is deleted, this field will be set to `NULL`.
 * 
 * @module models/session
 */

module.exports = (sequelize, Sequelize) => {
    const Session = sequelize.define('Session', {
        // Define the attributes for the Session model
        token: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true // Ensures that session tokens are unique
        },
        flag: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false // Default to false indicating the session is inactive
        },
        expiresAt: {
            type: Sequelize.DATE,
            allowNull: true // Expiry date is optional
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

    return Session;
};
