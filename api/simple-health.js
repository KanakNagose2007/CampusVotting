// Simple health check that definitely works
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method 
    });
  }

  // Simple health check response
  const healthData = {
    status: 'SUCCESS',
    message: 'CampusVote API is working!',
    timestamp: new Date().toISOString(),
    server: 'Vercel Serverless',
    version: '1.0.0',
    environment: {
      nodeEnv: process.env.NODE_ENV || 'production',
      hasMongoUri: !!process.env.MONGODB_URI,
      hasSendGridKey: !!process.env.EMAIL_SENDGRID_API_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET
    },
    endpoints: [
      '/api/simple-health - This endpoint',
      '/api/simple-login - Login without database',
      '/api/simple-register - Register without database'
    ]
  };

  return res.status(200).json(healthData);
}