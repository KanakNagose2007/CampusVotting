const clientPromise = require('../lib/mongodb');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test basic API functionality
    const basicTest = {
      success: true,
      message: 'API endpoint is working',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        mongoUriFormat: process.env.MONGODB_URI ? 'Valid format' : 'Missing'
      }
    };

    // Test MongoDB Atlas connection
    let databaseTest;
    try {
      console.log('Testing MongoDB Atlas connection...');
      const client = await clientPromise;
      const db = client.db('campusvote');
      
      // Test database connection with a simple operation
      const pingResult = await db.admin().ping();
      console.log('MongoDB ping successful:', pingResult);
      
      // Get database stats
      const stats = await db.stats();
      const userCount = await db.collection('users').estimatedDocumentCount();
      
      // Test a simple read operation
      const collections = await db.listCollections().toArray();
      
      databaseTest = {
        success: true,
        message: 'MongoDB Atlas connection successful',
        ping: pingResult,
        database: {
          name: db.databaseName,
          collections: collections.map(col => col.name),
          collectionCount: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          userCount
        },
        connectionDetails: {
          connected: true,
          readyState: 'connected'
        }
      };
      
      console.log('Database test successful:', databaseTest);
    } catch (dbError) {
      console.error('Database connection test failed:', dbError);
      databaseTest = {
        success: false,
        error: 'MongoDB Atlas connection failed',
        details: dbError.message,
        errorName: dbError.name,
        errorCode: dbError.code,
        troubleshooting: [
          'Check MongoDB Atlas network access settings (allow 0.0.0.0/0)',
          'Verify connection string format and credentials',
          'Ensure database user has proper permissions',
          'Check if cluster is running and accessible',
          'Verify the database name in connection string'
        ]
      };
      
      // Add specific troubleshooting based on error type
      if (dbError.name === 'MongoServerSelectionError') {
        databaseTest.specificIssue = 'Server selection failed - likely network or authentication issue';
      } else if (dbError.name === 'MongoParseError') {
        databaseTest.specificIssue = 'Connection string format error';
      } else if (dbError.code === 8000) {
        databaseTest.specificIssue = 'Authentication failed - check username/password';
      }
    }

    const overallSuccess = basicTest.success && databaseTest.success;

    return res.status(overallSuccess ? 200 : 503).json({
      overall: overallSuccess,
      api: basicTest,
      database: databaseTest,
      timestamp: new Date().toISOString(),
      nextSteps: overallSuccess ? [
        'Database connection is working!',
        'You can now initialize the database with /api/init-db',
        'Then test authentication with /api/login'
      ] : [
        'Fix the database connection issues above',
        'Check your MongoDB Atlas dashboard',
        'Verify environment variables in Vercel'
      ]
    });

  } catch (error) {
    console.error('Connection test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}