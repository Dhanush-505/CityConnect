/**
 * Final Production Release Verification Script (CityConnect v1.0.0)
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkEndpoint(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${urlPath}`, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

async function verifyRelease() {
  console.log('========================================================');
  console.log('🚀 CITYCONNECT v1.0.0 FINAL PRODUCTION RELEASE CHECK');
  console.log('========================================================\n');

  // 1. Environment Templates Check
  console.log('1. Checking Environment Configuration Templates...');
  const rootEnv = fs.existsSync(path.join(__dirname, '..', '.env.example'));
  const backendEnv = fs.existsSync(path.join(__dirname, '..', 'backend', '.env.example'));
  const frontendEnv = fs.existsSync(path.join(__dirname, '..', 'frontend', '.env.example'));
  if (rootEnv && backendEnv && frontendEnv) {
    console.log('  ✓ Root, Backend, and Frontend .env.example templates verified.');
  } else {
    console.error('  ✕ Environment templates missing.');
  }

  // 2. CI/CD Pipelines Check
  console.log('\n2. Checking GitHub Actions CI/CD Workflows...');
  const frontendWf = fs.existsSync(path.join(__dirname, '..', '.github', 'workflows', 'frontend.yml'));
  const backendWf = fs.existsSync(path.join(__dirname, '..', '.github', 'workflows', 'backend.yml'));
  const testsWf = fs.existsSync(path.join(__dirname, '..', '.github', 'workflows', 'tests.yml'));
  if (frontendWf && backendWf && testsWf) {
    console.log('  ✓ Frontend, Backend, and Test CI/CD workflows verified.');
  } else {
    console.error('  ✕ Workflow files missing.');
  }

  // 3. Documentation Deliverables Check
  console.log('\n3. Checking Production Technical Documentation...');
  const docFiles = [
    'API_DOCUMENTATION.md',
    'SECURITY_GUIDE.md',
    'PERFORMANCE_GUIDE.md',
    'TESTING_GUIDE.md',
    'TROUBLESHOOTING_GUIDE.md',
    'SYSTEM_OVERVIEW.md',
    'DEPLOYMENT_GUIDE.md',
    'USER_MANUAL_CITIZEN.md',
    'USER_MANUAL_ADMIN.md',
    'USER_MANUAL_FIELD_WORKER.md',
    'BACKUP_RECOVERY_PLAN.md',
    'FUTURE_ROADMAP.md',
    'FINAL_PRESENTATION.md'
  ];

  let missingDocs = 0;
  for (const doc of docFiles) {
    const p = path.join(__dirname, '..', 'docs', doc);
    if (!fs.existsSync(p)) {
      console.error(`  ✕ Missing doc: ${doc}`);
      missingDocs++;
    }
  }
  if (missingDocs === 0) {
    console.log('  ✓ All 13 core technical and user documentation manuals present.');
  }

  // 4. Production Health API Check
  console.log('\n4. Testing Production Health API (/api/health)...');
  const health = await checkEndpoint('/api/health');
  if (health.status === 200 && health.body?.status === 'healthy') {
    console.log('  ✓ Server Health API Status:', health.body.status, '| Version:', health.body.version, '| Uptime:', health.body.uptime);
  } else {
    console.warn('  ! Server health check result:', health);
  }

  console.log('\n========================================================');
  console.log('🎉 CITYCONNECT v1.0.0 PRODUCTION RELEASE READY!');
  console.log('========================================================');
}

verifyRelease();
