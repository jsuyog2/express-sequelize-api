/**
 * @file user.model.js
 * @description This file defines the Sequelize model for the Users table.
 * 
 * The User model represents users in the system, storing essential information about each user.
 * 
 * The attributes of the User model are as follows:
 * 
 * - `name`: A string field that holds the user's name. This field is optional.
 * - `username`: A string field that holds the user's username. This field is required and must be unique.
 * - `email`: A string field that holds the user's email address. This field is required and must be unique.
 * - `password`: A string field that stores the user's hashed password. This field is required.
 * - `phoneNumber`: A string field that holds the user's phone number. This field is optional and accommodates various phone number formats.
 * - `emailVerified`: A boolean field that indicates whether the user's email has been verified. Defaults to `false`.
 * - `acceptedTerms`: A boolean field that indicates whether the user has accepted the terms of service. This field is required and defaults to `false`.
 * 
 * @module models/user
 */

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("Users", {
        // Define the attributes for the User model
        name: {
            type: Sequelize.STRING,
            allowNull: true // Name is optional
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true // Ensures that usernames are unique
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true // Ensures that emails are unique
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: Sequelize.STRING, // Use STRING to accommodate various phone number formats
            allowNull: true, // Phone number is optional
        },
        emailVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false // Default to false indicating email is not verified
        },
        acceptedTerms: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false // Default to false indicating terms are not accepted
        },
    });

    return User;
};
