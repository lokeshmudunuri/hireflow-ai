#!/usr/bin/env node
/**
 * HireFlow Database Migration Runner
 * Executes version-controlled migrations against active database.
 */

const path = require('path');
const backendDir = path.resolve(__dirname, '../../backend');
module.paths.push(path.join(backendDir, 'node_modules'));

require('dotenv').config({ path: path.join(backendDir, '.env') });
const { connectDB, sequelize } = require('../../backend/src/config/database');
const initialSchema = require('./001_initial_schema');

async function runMigrations() {
  console.log('==============================================================');
  console.log('📦 HireFlow Schema Migrations Runner');
  console.log('==============================================================');

  try {
    await connectDB();
    console.log(`📡 Connected to database dialect: ${sequelize.getDialect().toUpperCase()}`);

    console.log('▶ Running Migration: 001_initial_schema.js ...');
    await initialSchema.up(sequelize.getQueryInterface(), sequelize);
    console.log('✅ Migration 001_initial_schema.js executed successfully.');

    console.log('==============================================================');
    console.log('🎉 All migrations applied cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration runner failed:', error);
    process.exit(1);
  }
}

runMigrations();
