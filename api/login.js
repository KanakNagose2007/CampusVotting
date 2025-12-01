const clientPromise = require('../lib/mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    const { email, password, action = 'login' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Connect to MongoDB Atlas
    const client = await clientPromise;
    const db = client.db('campusvote');
    
    if (action === 'register') {
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'student',
        name: email.split('@')[0].replace(/\.|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        studentId: `STU${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        isActive: true,
        lastLogin: null,
        profile: {
          department: '',
          year: '',
          phoneNumber: ''
        }
      };

      const result = await db.collection('users').insertOne(newUser);
      
      const token = jwt.sign(
        { 
          userId: result.insertedId.toString(),
          email: newUser.email,
          role: newUser.role 
        },
        process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: result.insertedId.toString(),
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
          studentId: newUser.studentId
        }
      });
    } else {
      // Login
      const user = await db.collection('users').findOne({ 
        email: email.toLowerCase() 
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated. Please contact administrator.' });
      }

      // Update last login
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );

      const token = jwt.sign(
        { 
          userId: user._id.toString(),
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          studentId: user.studentId,
          profile: user.profile || {}
        }
      });
    }
  } catch (error) {
    console.error('MongoDB Atlas Auth error:', error);
    
    // Provide more specific error information
    if (error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to MongoDB Atlas. Please check network settings.',
        type: 'connection_error'
      });
    }
    
    if (error.name === 'MongoParseError') {
      return res.status(503).json({ 
        error: 'Database configuration error',
        details: 'Invalid MongoDB connection string format.',
        type: 'config_error'
      });
    }

    return res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      type: 'general_error'
    });
  }
}