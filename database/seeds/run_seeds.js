#!/usr/bin/env node
/**
 * HireFlow Database Seed Runner
 * Populates realistic recruitment data (Users, Jobs, Candidates, Applications, Interviews).
 */

const path = require('path');
const backendDir = path.resolve(__dirname, '../../backend');
module.paths.push(path.join(backendDir, 'node_modules'));

require('dotenv').config({ path: path.join(backendDir, '.env') });
const seedHireflow = require('./001_seed_hireflow');

async function runSeeds() {
  console.log('==============================================================');
  console.log('🌱 HireFlow Database Seed Runner');
  console.log('==============================================================');

  try {
    await seedHireflow();
    console.log('==============================================================');
    console.log('🎉 Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed runner failed:', error);
    process.exit(1);
  }
}

runSeeds();
