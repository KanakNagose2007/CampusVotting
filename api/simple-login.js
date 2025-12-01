// Simple login endpoint without database for testing
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST.',
      method: req.method 
    });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        received: { email: !!email, password: !!password }
      });
    }

    // Hardcoded test accounts (since we can't access database)
    const testAccounts = {
      'admin@campusvote.com': {
        password: 'admin123',
        name: 'Campus Admin',
        role: 'admin',
        id: 'admin-001'
      },
      'voter@test.com': {
        password: 'voter123', 
        name: 'Test Voter',
        role: 'voter',
        id: 'voter-001'
      },
      'test@example.com': {
        password: 'test123',
        name: 'Test User',
        role: 'voter', 
        id: 'test-001'
      }
    };

    // Check credentials
    const user = testAccounts[email.toLowerCase()];
    
    if (!user || user.password !== password) {
      return res.status(400).json({
        error: 'Invalid email or password',
        availableAccounts: Object.keys(testAccounts).map(email => ({
          email,
          password: testAccounts[email].password
        }))
      });
    }

    // Generate simple token (in production, use proper JWT)
    const token = `test-token-${user.id}-${Date.now()}`;

    // Successful login
    return res.status(200).json({
      success: true,
      message: 'Login successful! (Test mode - no database)',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: email,
        role: user.role
      },
      note: 'This is test mode. Database connection will be restored soon.'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Server error during login',
      details: error.message
    });
  }
}