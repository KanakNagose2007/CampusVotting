const clientPromise = require('../lib/mongodb');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB Atlas
    const client = await clientPromise;
    const db = client.db('campusvote');
    
    // Check if users already exist
    const existingUserCount = await db.collection('users').countDocuments();
    
    if (existingUserCount > 0) {
      return res.status(200).json({
        message: 'Database already initialized',
        userCount: existingUserCount,
        status: 'already_initialized'
      });
    }

    // Create default users
    const defaultUsers = [
      {
        email: 'admin@campusvote.edu',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        name: 'System Administrator',
        studentId: 'ADMIN001',
        createdAt: new Date(),
        isActive: true,
        profile: {
          department: 'IT Administration',
          year: '',
          phoneNumber: ''
        }
      },
      {
        email: 'student@campusvote.edu',
        password: await bcrypt.hash('student123', 12),
        role: 'student',
        name: 'Test Student',
        studentId: 'STU001',
        createdAt: new Date(),
        isActive: true,
        profile: {
          department: 'Computer Science',
          year: '3rd Year',
          phoneNumber: ''
        }
      },
      {
        email: 'voter@test.edu',
        password: await bcrypt.hash('voter123', 12),
        role: 'student',
        name: 'Test Voter',
        studentId: 'STU002',
        createdAt: new Date(),
        isActive: true,
        profile: {
          department: 'Engineering',
          year: '2nd Year',
          phoneNumber: ''
        }
      }
    ];

    // Insert users into database
    const result = await db.collection('users').insertMany(defaultUsers);
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ studentId: 1 }, { unique: true });

    return res.status(201).json({
      message: 'Database initialized successfully',
      usersCreated: result.insertedCount,
      defaultAccounts: [
        { email: 'admin@campusvote.edu', password: 'admin123', role: 'admin' },
        { email: 'student@campusvote.edu', password: 'student123', role: 'student' },
        { email: 'voter@test.edu', password: 'voter123', role: 'student' }
      ],
      status: 'initialized'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Provide more specific error information
    if (error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to MongoDB Atlas. Please check your network settings and connection string.',
        type: 'connection_error',
        troubleshooting: [
          'Verify MongoDB Atlas network access allows 0.0.0.0/0',
          'Check if your connection string is correct',
          'Ensure database user has proper permissions'
        ]
      });
    }
    
    if (error.name === 'MongoParseError') {
      return res.status(503).json({ 
        error: 'Database configuration error',
        details: 'Invalid MongoDB connection string format.',
        type: 'config_error'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate key error',
        details: 'Some users already exist in the database',
        type: 'duplicate_error'
      });
    }

    return res.status(500).json({ 
      error: 'Database initialization failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      type: 'general_error'
    });
  }
}