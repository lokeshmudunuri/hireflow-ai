/**
 * Seed: 001_seed_hireflow.js
 * Populates realistic ATS data: 5 users, 6 jobs, 14 candidates, interviews, and notifications.
 */

const path = require('path');
const { spawn } = require('child_process');

module.exports = function seedHireflow() {
  return new Promise((resolve, reject) => {
    const seedScript = path.resolve(__dirname, '../../backend/src/scripts/seed.js');
    console.log(`Executing seeder: ${seedScript}`);

    const child = spawn(process.execPath, [seedScript], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../../backend')
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Seeder script exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
};
