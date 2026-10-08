const { sequelize, connectDB } = require('../config/database');
const models = require('../models');

async function migrate() {
  console.log('--- Starting HireFlow Database Migration ---');
  try {
    await connectDB();
    // Using sync({ force: false, alter: true }) ensures all tables and relations exist
    await sequelize.sync({ alter: true });
    console.log('✅ Database migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
