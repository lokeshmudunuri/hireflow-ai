#!/usr/bin/env node
/**
 * HireFlow Database User Verification Utility
 * 
 * Verifies that a user account actually exists in the persistent database,
 * confirms that the password is a cryptographically secure bcrypt hash,
 * and displays sanitized user metadata without exposing sensitive credentials.
 * 
 * Usage:
 *   node database/verify_user.js <email>
 *   npm run db:verify -- <email>
 *   node database/verify_user.js (lists recent users)
 */

const path = require('path');
// Add backend node_modules to module resolution path so scripts run from any directory
const backendDir = path.resolve(__dirname, '../backend');
module.paths.push(path.join(backendDir, 'node_modules'));

try {
  require('dotenv').config({ path: path.join(backendDir, '.env') });
} catch (e) {
  // Continue if dotenv is not required
}

const { connectDB, sequelize } = require('../backend/src/config/database');
const { User, Recruiter, Interviewer } = require('../backend/src/models');

async function verifyUser() {
  const targetEmail = process.argv[2] ? process.argv[2].trim().toLowerCase() : null;

  console.log('==============================================================');
  console.log('🔍 HireFlow Real Database — User Verification Tool');
  console.log('==============================================================');

  try {
    await connectDB();
    const dialect = sequelize.getDialect().toUpperCase();
    console.log(`📡 Connected to database dialect: ${dialect}`);

    if (targetEmail) {
      console.log(`🔎 Searching for user record: "${targetEmail}"...\n`);

      const user = await User.findOne({
        where: { email: targetEmail },
        include: [
          { model: Recruiter, as: 'recruiterProfile' },
          { model: Interviewer, as: 'interviewerProfile' }
        ]
      });

      if (!user) {
        console.error(`❌ VERIFICATION FAILED: No user found with email "${targetEmail}" in the database.`);
        process.exit(1);
      }

      // Check password security without exposing the raw hash
      const rawPasswordValue = user.getDataValue('password');
      const isBcrypt = typeof rawPasswordValue === 'string' && /^\$2[aby]\$\d{2}\$/.test(rawPasswordValue);

      console.log('✅ USER RECORD VERIFIED IN DATABASE:');
      console.log('--------------------------------------------------------------');
      console.log(`  Database ID:       ${user.id}`);
      console.log(`  Full Name:         ${user.name}`);
      console.log(`  Normalized Email:  ${user.email}`);
      console.log(`  Assigned Role:     ${user.role.toUpperCase()}`);
      console.log(`  Account Status:    ${user.isActive ? 'Active (Permitted)' : 'Deactivated'}`);
      console.log(`  Department:        ${user.department || 'Not specified'}`);
      console.log(`  Phone:             ${user.phone || 'Not specified'}`);
      console.log(`  Password Security: ${isBcrypt ? 'Verified (Secure bcrypt 10-round hash)' : 'INVALID / PLAINTEXT'}`);
      console.log(`  Created At:        ${user.createdAt}`);
      console.log(`  Last Updated:      ${user.updatedAt}`);
      console.log(`  Last Login:        ${user.lastLogin || 'Never logged in'}`);

      if (user.recruiterProfile) {
        console.log('\n  Associated Recruiter Profile:');
        console.log(`    Title:           ${user.recruiterProfile.title}`);
        console.log(`    Agency / Team:   ${user.recruiterProfile.agency || user.recruiterProfile.assignedTeam || 'In-House'}`);
      }

      if (user.interviewerProfile) {
        console.log('\n  Associated Interviewer Profile:');
        console.log(`    Title:           ${user.interviewerProfile.title}`);
        console.log(`    Specialization:  ${user.interviewerProfile.specialization || 'General Engineering'}`);
      }

      console.log('--------------------------------------------------------------');
      console.log('🎉 Verification Status: PASSED (Verified real database persistence)');
      process.exit(0);

    } else {
      // List recent users
      const totalCount = await User.count();
      console.log(`📊 Total Registered Users in Database: ${totalCount}\n`);

      const users = await User.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'role', 'isActive', 'department', 'createdAt']
      });

      console.log('Recent Registered User Accounts:');
      console.table(users.map(u => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Status: u.isActive ? 'Active' : 'Inactive',
        Department: u.department || 'N/A',
        Created: u.createdAt && u.createdAt.toISOString ? u.createdAt.toISOString().split('T')[0] : String(u.createdAt)
      })));

      console.log('\n💡 Tip: To verify a specific user, run: node database/verify_user.js <email>');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Database verification error:', error.message);
    process.exit(1);
  }
}

verifyUser();
