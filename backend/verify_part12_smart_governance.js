import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('====================================================');
  console.log('   Part 12 - Smart Governance Verification Script   ');
  console.log('====================================================\n');

  try {
    // 1. Log in as Citizen
    console.log('1. Logging in as Citizen...');
    const citizenLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'citizen@cityconnect.com',
      password: 'Citizen@123',
    });
    const citizenToken = citizenLoginRes.data.data.token;
    console.log('   ✓ Citizen Login Successful.\n');

    // 2. Log in as Admin
    console.log('2. Logging in as Admin...');
    const adminLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@cityconnect.com',
      password: 'Admin@123',
    });
    const adminToken = adminLoginRes.data.data.token;
    console.log('   ✓ Admin Login Successful.\n');

    // 3. Test Public Transparency Dashboard (Unauthenticated)
    console.log('3. Testing GET /api/public/dashboard (No Auth)...');
    const publicRes = await axios.get(`${API_BASE_URL}/public/dashboard`);
    console.log('   ✓ Public Dashboard fetched successfully.');
    console.log(`     Total Complaints: ${publicRes.data.data.totalComplaints}`);
    console.log(`     Resolution Rate: ${publicRes.data.data.resolutionRate}%`);
    console.log(`     Smart City Score: ${publicRes.data.data.cityIndexScore} (${publicRes.data.data.cityIndexStatus})\n`);

    // 4. Test Executive Dashboard (Admin Auth)
    console.log('4. Testing GET /api/executive/dashboard...');
    const execRes = await axios.get(`${API_BASE_URL}/executive/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   ✓ Executive Dashboard fetched successfully.');
    console.log(`     City Performance Score: ${execRes.data.data.cityPerformanceIndex.score}`);
    console.log(`     Department Scorecards Count: ${execRes.data.data.departmentScorecards.length}`);
    if (execRes.data.data.departmentScorecards.length > 0) {
      const topDept = execRes.data.data.departmentScorecards[0];
      console.log(`     Top Department: ${topDept.department} (Grade ${topDept.grade}, Score ${topDept.performanceScore})`);
    }
    console.log(`     AI Insights: ${execRes.data.data.aiInsights[0]}\n`);

    // 5. Test SLA Metrics and Escalation Engine
    console.log('5. Testing GET /api/sla...');
    const slaRes = await axios.get(`${API_BASE_URL}/sla`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    console.log('   ✓ SLA metrics retrieved.');
    console.log(`     Overall SLA Compliance: ${slaRes.data.data.overallCompliance}%\n`);

    console.log('   Testing PUT /api/sla/escalate...');
    const escalateRes = await axios.put(`${API_BASE_URL}/sla/escalate`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`   ✓ Escalation Engine executed: ${escalateRes.data.data.escalatedCount} complaints escalated.\n`);

    // 6. Test Complaint Upvoting System
    console.log('6. Testing Complaint Upvoting (POST /api/vote)...');
    const activeIssue = publicRes.data.data.activePublicIssues[0];
    if (activeIssue) {
      const voteRes = await axios.post(
        `${API_BASE_URL}/vote`,
        { complaintId: activeIssue.id },
        { headers: { Authorization: `Bearer ${citizenToken}` } }
      );
      console.log(`   ✓ Vote processed. Upvotes count: ${voteRes.data.data.votesCount}, Has Voted: ${voteRes.data.data.hasVoted}\n`);
    } else {
      console.log('   ⚠ No active public issues found to vote on, skipping upvote action.\n');
    }

    // 7. Test Digital Survey Module
    console.log('7. Testing Digital Survey creation (POST /api/surveys)...');
    const surveyPayload = {
      title: 'City Water Quality Survey 2026',
      description: 'Please rate the water pressure and cleanliness in your area.',
      category: 'Water Supply',
      targetDepartment: 'Water Supply',
      questions: [
        {
          id: 'q1',
          type: 'rating',
          questionText: 'How satisfied are you with daily water pressure? (1-5)',
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          questionText: 'Are there any frequent water supply interruptions?',
          options: ['Yes, daily', 'Occasional', 'Rarely', 'Never'],
        },
      ],
    };
    const createSurveyRes = await axios.post(`${API_BASE_URL}/surveys`, surveyPayload, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const createdSurvey = createSurveyRes.data.data;
    console.log(`   ✓ Survey created: ID ${createdSurvey._id} ("${createdSurvey.title}")\n`);

    console.log('   Testing GET /api/surveys (Citizen Auth)...');
    const surveysRes = await axios.get(`${API_BASE_URL}/surveys`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    console.log(`   ✓ Retrieved ${surveysRes.data.data.length} active surveys.\n`);

    console.log('   Testing POST /api/surveys/:id/respond...');
    const respondRes = await axios.post(
      `${API_BASE_URL}/surveys/${createdSurvey._id}/respond`,
      {
        answers: [
          { questionId: 'q1', value: 4 },
          { questionId: 'q2', value: 'Occasional' },
        ],
      },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('   ✓ Survey response submitted successfully.\n');

    // 8. Test Emergency Incident Reporting
    console.log('8. Testing Emergency Incident Reporting (POST /api/emergencies)...');
    const emergencyRes = await axios.post(
      `${API_BASE_URL}/emergencies`,
      {
        title: 'Flash Flood Near Underpass',
        type: 'Flood',
        location: 'MG Road Junction, Bengaluru',
        latitude: 12.9716,
        longitude: 77.5946,
        description: 'Water accumulation of 3 feet disrupting traffic and creating hazards.',
        assignedDepartment: 'Drainage & Waste Management',
      },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log(`   ✓ Emergency reported: ID ${emergencyRes.data.data.incidentId} (${emergencyRes.data.data.type})\n`);

    console.log('   Testing GET /api/emergencies...');
    const emergenciesRes = await axios.get(`${API_BASE_URL}/emergencies`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    console.log(`   ✓ Retrieved ${emergenciesRes.data.data.length} emergency incidents.\n`);

    // 9. Test Leaderboards
    console.log('9. Testing GET /api/leaderboards...');
    const leaderboardsRes = await axios.get(`${API_BASE_URL}/leaderboards`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    console.log('   ✓ Leaderboards fetched:');
    console.log(`     Top Dept: ${leaderboardsRes.data.data.departmentLeaderboard[0]?.name || 'N/A'}`);
    console.log(`     Top Field Worker: ${leaderboardsRes.data.data.workerLeaderboard[0]?.name || 'N/A'} (Score: ${leaderboardsRes.data.data.workerLeaderboard[0]?.qualityScore || 'N/A'})\n`);

    console.log('====================================================');
    console.log('  🎉 All Part 12 Backend API Verification Passed!   ');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Part 12 Verification Failed:', error.response?.data || error.message);
  }
}

runVerification();
