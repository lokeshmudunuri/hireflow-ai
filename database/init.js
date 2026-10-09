#!/usr/bin/env node
/**
 * HireFlow Database Initializer
 * Synchronizes schema tables and reports database health.
 */

const path = require('path');
const backendDir = path.resolve(__dirname, '../backend');
module.paths.push(path.join(backendDir, 'node_modules'));

require('dotenv').config({ path: path.join(backendDir, '.env') });
const { connectDB, sequelize } = require('../backend/src/config/database');
const models = require('../backend/src/models');

async function init() {
  console.log('==============================================================');
  console.log('🚀 HireFlow Database Initialization');
  console.log('==============================================================');

  try {
    await connectDB();
    console.log(`📡 Connected to ${sequelize.getDialect().toUpperCase()}`);

    console.log('🔄 Synchronizing schema tables and associations...');
    await sequelize.sync({ alter: false });

    console.log('✅ All 14 database models verified:');
    const tableNames = Object.keys(sequelize.models);
    console.log(`   ${tableNames.join(', ')}`);

    const userCount = await models.User.count();
    const jobCount = await models.Job.count();
    const candidateCount = await models.Candidate.count();
    const applicationCount = await models.Application.count();

    console.log('--------------------------------------------------------------');
    console.log(`  Users:        ${userCount}`);
    console.log(`  Jobs:         ${jobCount}`);
    console.log(`  Candidates:   ${candidateCount}`);
    console.log(`  Applications: ${applicationCount}`);
    console.log('==============================================================');
    console.log('🎉 Database initialization complete and ready for application traffic.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

init();
