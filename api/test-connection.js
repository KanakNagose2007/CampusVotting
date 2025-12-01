// Simple endpoint to test if the API is working without database
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Test basic functionality without database
    const testData = {
      status: 'OK',
      message: 'CampusVote API is running without database',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      mongoUri: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
      testAccounts: {
        admin: 'admin@campusvote.com / admin123',
        voter: 'voter@test.com / voter123'
      }
    };

    res.status(200).json(testData);
  } else if (req.method === 'POST') {
    // Simple login without database for testing
    const { email, password } = req.body;
    
    // Hardcoded test accounts
    const testUsers = {
      'admin@campusvote.com': { password: 'admin123', role: 'admin', name: 'Campus Admin' },
      'voter@test.com': { password: 'voter123', role: 'voter', name: 'Test Voter' }
    };

    if (testUsers[email] && testUsers[email].password === password) {
      res.status(200).json({
        success: true,
        message: 'Login successful (test mode)',
        user: {
          email,
          name: testUsers[email].name,
          role: testUsers[email].role
        },
        token: 'test-token-' + Date.now()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}