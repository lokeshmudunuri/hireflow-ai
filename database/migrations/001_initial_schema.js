/**
 * Migration: 001_initial_schema.js
 * Synchronizes and verifies all core tables and relations for HireFlow ATS.
 */

const models = require('../../backend/src/models');

module.exports = {
  up: async (queryInterface, sequelize) => {
    // Synchronize all models defined in Sequelize without destructive force
    await sequelize.sync({ alter: true });
    return Promise.resolve();
  },

  down: async (queryInterface, sequelize) => {
    // Drop all tables in reverse dependency order
    await sequelize.drop();
    return Promise.resolve();
  }
};
