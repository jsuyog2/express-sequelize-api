/**
 * @file jwt.config.js
 * @description This file exports the configuration settings for JSON Web Token (JWT) authentication.
 * It includes the paths to the public and private key files for JWT signing and verification,
 * as well as the secret used for token generation.
 * 
 * @constant {string} publicKeyPath - The file path to the public key used for verifying JWTs.
 * @constant {string} privateKeyPath - The file path to the private key used for signing JWTs.
 * @constant {string} secret - The secret key used for encoding and decoding JWTs.
 */
const {
    JWT_PUBLICKEY_PATH, JWT_PRIVATEKEY_PATH, JWT_SECRET
} = process.env;

module.exports = {
    publicKeyPath: JWT_PUBLICKEY_PATH,
    privateKeyPath: JWT_PRIVATEKEY_PATH,
    secret: JWT_SECRET,
};
