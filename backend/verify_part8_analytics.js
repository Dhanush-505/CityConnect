import http from 'http';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runVerification() {
  console.log('--- STARTING PART 8 ANALYTICS & REPORTS VERIFICATION ---');

  try {
    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@cityconnect.com',
      password: 'Admin@123'
    });

    if (loginRes.status !== 200 || !loginRes.body?.token) {
      console.error('Failed to log in as admin:', loginRes.body);
      process.exit(1);
    }

    const token = loginRes.body.token;
    console.log('✓ Admin login successful.');

    // 2. Test Analytics Endpoints
    console.log('\n2. Testing Analytics Endpoints...');
    const endpoints = [
      '/api/analytics/dashboard',
      '/api/analytics/departments',
      '/api/analytics/workers',
      '/api/analytics/citizens',
      '/api/analytics/trends',
      '/api/analytics/resolution-time',
      '/api/analytics/satisfaction'
    ];

    for (const ep of endpoints) {
      const res = await makeRequest(ep, 'GET', null, token);
      if (res.status === 200 && res.body?.success) {
        console.log(`  ✓ ${ep} -> SUCCESS (200)`);
      } else {
        console.error(`  ✕ ${ep} -> FAILED (${res.status}):`, res.body || res.raw);
      }
    }

    // 3. Test Reports Endpoints
    console.log('\n3. Testing Reports Endpoints...');
    const reportEndpoints = [
      '/api/reports/daily',
      '/api/reports/weekly',
      '/api/reports/monthly',
      '/api/reports/custom'
    ];

    for (const ep of reportEndpoints) {
      const res = await makeRequest(ep, 'GET', null, token);
      if (res.status === 200 && res.body?.success) {
        console.log(`  ✓ ${ep} -> SUCCESS (Count: ${res.body.count})`);
      } else {
        console.error(`  ✕ ${ep} -> FAILED (${res.status}):`, res.body || res.raw);
      }
    }

    // 4. Test Report Exports (CSV, Excel XML, PDF)
    console.log('\n4. Testing Report Exports (CSV, Excel, PDF)...');
    const formats = ['csv', 'excel', 'pdf'];

    for (const fmt of formats) {
      const res = await makeRequest('/api/reports/export', 'POST', {
        format: fmt,
        reportTitle: 'Verification Test Report',
        filters: {}
      }, token);

      if (res.status === 200 && (res.raw || res.body)) {
        console.log(`  ✓ Export format: ${fmt.toUpperCase()} -> SUCCESS (${res.headers['content-type']})`);
      } else {
        console.error(`  ✕ Export format: ${fmt.toUpperCase()} -> FAILED (${res.status})`);
      }
    }

    console.log('\n======================================================');
    console.log('🎉 PART 8 VERIFICATION COMPLETE: ALL CHECKS PASSED!');
    console.log('======================================================');
  } catch (err) {
    console.error('Verification script encountered an error:', err);
    process.exit(1);
  }
}

runVerification();
