// Test MongoDB connection with better error handling
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment variables
  const mongoUri = process.env.MONGODB_URI;
  const hasMongoUri = !!mongoUri;
  
  let connectionResult = {
    mongoUri: hasMongoUri ? 'Configured' : 'Not configured',
    connectionString: hasMongoUri ? mongoUri.replace(/:[^:@]*@/, ':****@') : 'None',
    environment: process.env.NODE_ENV || 'development'
  };

  if (!hasMongoUri) {
    return res.status(200).json({
      status: 'WARNING',
      message: 'MongoDB URI not configured',
      details: connectionResult,
      solution: 'Set MONGODB_URI environment variable'
    });
  }

  // Try to connect to MongoDB
  try {
    const { MongoClient } = require('mongodb');
    
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    
    // Test database access
    const db = client.db('campusvote');
    const collections = await db.listCollections().toArray();
    
    await client.close();

    res.status(200).json({
      status: 'SUCCESS',
      message: 'MongoDB connection successful',
      details: {
        ...connectionResult,
        collections: collections.length,
        database: 'campusvote'
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'MongoDB connection failed',
      error: error.message,
      details: connectionResult,
      suggestions: [
        'Check if MongoDB Atlas cluster is active',
        'Verify network access (whitelist 0.0.0.0/0)',
        'Check username and password in connection string',
        'Ensure cluster is not paused'
      ]
    });
  }
}