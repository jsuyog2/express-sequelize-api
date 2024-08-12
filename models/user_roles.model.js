/**
 * @file user_roles.model.js
 * @description This file defines the Sequelize model for the UserRoles junction table.
 * 
 * The UserRoles model represents the many-to-many relationship between users and roles. It serves as a junction table that links users with their assigned roles.
 * 
 * The attributes of the UserRoles model are as follows:
 * 
 * - `userId`: An integer field that references the ID of a user from the `users` table. This field is required and has a cascading delete behavior, meaning that related records will be removed if the user is deleted.
 * - `roleId`: An integer field that references the ID of a role from the `userRoles` table. This field is required and has a cascading delete behavior, meaning that related records will be removed if the role is deleted.
 * 
 * @module models/user_roles
 */

module.exports = (sequelize, Sequelize) => {
    const UserRoles = sequelize.define("UserRoles", {
        // Define attributes for the junction table
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // Reference to the User model
                key: 'id'
            },
            onDelete: 'CASCADE' // Ensure related records are deleted if the user is deleted
        },
        roleId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'userRoles', // Reference to the UserRole model
                key: 'id'
            },
            onDelete: 'CASCADE' // Ensure related records are deleted if the role is deleted
        }
    });

    return UserRoles;
};
