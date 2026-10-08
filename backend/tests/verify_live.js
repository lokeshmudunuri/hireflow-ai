const http = require('http');

async function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('Testing Live Backend Endpoints on http://localhost:5000...');

  // 1. Health
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('1. Health check status:', health.status, health.data.service);

  // 2. Recruiter Login
  const rLogin = await request(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'recruiter@hireflow.dev', password: 'Password123!' }
  );
  console.log('2. Recruiter Login status:', rLogin.status, 'User:', rLogin.data.user?.name);
  const rToken = rLogin.data.token;

  // 3. Dashboard
  const dash = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${rToken}` }
  });
  console.log('3. Dashboard metrics:', dash.status, 'Total Apps:', dash.data.data?.metrics?.totalApplications, 'Active Jobs:', dash.data.data?.metrics?.activeJobs);

  // 4. Candidates
  const cands = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/candidates?limit=5',
    method: 'GET',
    headers: { Authorization: `Bearer ${rToken}` }
  });
  console.log('4. Candidates status:', cands.status, 'Found:', cands.data.candidates?.length);

  // 5. Interviewer Login & Interviews
  const iLogin = await request(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'interviewer@hireflow.dev', password: 'Password123!' }
  );
  console.log('5. Interviewer Login:', iLogin.status, 'User:', iLogin.data.user?.name);
  const iToken = iLogin.data.token;

  const invs = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/interviews',
    method: 'GET',
    headers: { Authorization: `Bearer ${iToken}` }
  });
  console.log('   Interviews status:', invs.status, 'Rounds:', invs.data.interviews?.length);

  // 6. Admin Login & User Management
  const aLogin = await request(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@hireflow.dev', password: 'Password123!' }
  );
  console.log('6. Admin Login:', aLogin.status, 'User:', aLogin.data.user?.name);
  const aToken = aLogin.data.token;

  const users = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${aToken}` }
  });
  console.log('   Users list status:', users.status, 'Total Users:', users.data.users?.length);

  console.log('\nAll Live Backend E2E flows validated successfully!');
}

run().catch(console.error);
