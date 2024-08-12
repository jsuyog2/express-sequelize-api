/**
 * @file index.js
 * @description This file initializes the Sequelize ORM and sets up model associations.
 * 
 * The file configures Sequelize using the database connection settings and defines associations between models.
 * 
 * The following models are initialized:
 * 
 * - `User`: Represents users in the system.
 * - `Session`: Represents user sessions.
 * - `Log`: Represents system logs.
 * - `Role`: Represents roles that users can have.
 * - `UserRoles`: Represents the many-to-many relationship between users and roles.
 * 
 * Associations are defined as follows:
 * 
 * - `Log` and `Session` models are associated with the `User` model through a foreign key `userId`.
 * - The `User` model has a many-to-many relationship with the `Role` model through the `UserRoles` junction table.
 * - The `Role` model also has a many-to-many relationship with the `User` model through the `UserRoles` junction table.
 * 
 * @module models/index
 */

const Sequelize = require("sequelize");
const db_config = require('./../config/database.config');
const sequelize = new Sequelize(
    db_config.connectionString,
    { logging: false } // Disable logging
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.session = require("./session.model.js")(sequelize, Sequelize);
db.log = require("./log.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.user_roles = require("./user_roles.model.js")(sequelize, Sequelize);

// Define model associations
db.log.belongsTo(db.user, {
    foreignKey: 'userId',
    as: 'user'
});

db.session.belongsTo(db.user, {
    foreignKey: 'userId',
    as: 'user'
});

db.user.belongsToMany(db.role, {
    through: db.user_roles, // Junction table
    foreignKey: 'userId',
    otherKey: 'roleId'
});

db.role.belongsToMany(db.user, {
    through: db.user_roles, // Junction table for many-to-many relationship
    foreignKey: 'roleId',
    otherKey: 'userId'
});

module.exports = db;
