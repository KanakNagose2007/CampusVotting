import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User model schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
  isApproved: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Database connection
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@campusvote.com' });
    const voterExists = await User.findOne({ email: 'voter@test.com' });

    const results = [];

    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const adminUser = new User({
        name: 'Campus Admin',
        email: 'admin@campusvote.com',
        password: hashedPassword,
        studentId: 'ADMIN001',
        department: 'Administration',
        year: 4,
        role: 'admin',
        isApproved: true,
        isEmailVerified: true
      });
      await adminUser.save();
      results.push('Admin user created');
    } else {
      results.push('Admin user already exists');
    }

    if (!voterExists) {
      // Create test voter
      const hashedPassword = await bcrypt.hash('voter123', 12);
      const voterUser = new User({
        name: 'Test Voter',
        email: 'voter@test.com',
        password: hashedPassword,
        studentId: 'STU001',
        department: 'Computer Science',
        year: 3,
        role: 'voter',
        isApproved: true,
        isEmailVerified: true
      });
      await voterUser.save();
      results.push('Test voter created');
    } else {
      results.push('Test voter already exists');
    }

    const userCount = await User.countDocuments();

    res.status(200).json({
      message: 'Database initialization complete',
      results,
      userCount,
      adminAccount: 'admin@campusvote.com / admin123',
      voterAccount: 'voter@test.com / voter123'
    });

  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ 
      error: 'Database initialization failed',
      details: error.message 
    });
  }
}