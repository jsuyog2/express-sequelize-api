/**
 * @file swagger.config.js
 * @description This file configures Swagger for API documentation.
 * It uses `swagger-jsdoc` to generate the Swagger documentation based on the API routes,
 * and `swagger-ui-express` to serve the documentation as a web interface.
 * 
 * The Swagger configuration includes the API title, version, description, and contact information,
 * as well as the server URL. The API routes are documented based on the paths provided.
 * 
 * @module swagger.config
 * @requires swagger-jsdoc
 * @requires swagger-ui-express
 * 
 * @param {object} app - The Express application object.
 * @function
 * @description Sets up the Swagger UI to serve API documentation at the '/api-docs' endpoint.
 */
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'express-sequelize-api',
            version: '1.0.0',
            description: 'API Information',
            contact: {
                name: 'Suyog Jadhav',
                email: 'jsuyog2@gmail.com'
            },
            servers: ['http://localhost:3000']
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./routes/*.js'], // Path to the API routes files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
