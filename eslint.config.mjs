/**
 * @file eslint.config.mjs
 * @description ESLint configuration file that sets up linting rules and environments for JavaScript and Jest.
 * 
 * This configuration extends the recommended ESLint rules for JavaScript, includes Jest-specific linting rules,
 * and integrates environment globals for Node.js and Jest.
 * 
 * Key features:
 * 
 * - **Globals**: Sets global variables for Node.js and Jest environments.
 * - **Plugins**: Includes the `eslint-plugin-jest` plugin for Jest-specific linting rules.
 * - **Recommended Rules**: Applies the recommended configuration from the ESLint `@eslint/js` package.
 * 
 * @module .eslintrc
 */

import globals from "globals";
import pluginJs from "@eslint/js";
import jest from 'eslint-plugin-jest';

export default [
  // Specify the environment globals for Node.js and Jest
  {
    languageOptions: { 
      globals: { 
        ...globals.node, // Node.js globals
        ...jest.environments.globals.globals // Jest globals
      } 
    }
  },
  // Add Jest plugin for Jest-specific linting rules
  {
    plugins: {
      jest
    }
  },
  // Apply the recommended ESLint rules for JavaScript
  pluginJs.configs.recommended
];
