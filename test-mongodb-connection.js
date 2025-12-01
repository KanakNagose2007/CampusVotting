const mongoose = require('mongoose');
const colors = require('colors'); // Make sure to install: npm install colors

// Test MongoDB Atlas connection
async function testMongoConnection() {
    try {
        console.log('🔍 Testing MongoDB Atlas connection...\n'.cyan);
        
        // Get connection string from environment or prompt
        const mongoURI = process.env.MONGODB_URI || process.argv[2];
        
        if (!mongoURI) {
            console.log('❌ Please provide MongoDB URI as environment variable or argument:'.red);
            console.log('Example:'.yellow);
            console.log('node test-mongodb-connection.js "mongodb+srv://username:password@cluster.mongodb.net/campusvote"'.green);
            process.exit(1);
        }

        console.log('📡 Connecting to MongoDB Atlas...'.blue);
        
        // Connect with timeout
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        });

        console.log('✅ Successfully connected to MongoDB Atlas!'.green);
        
        // Test database operations
        console.log('🧪 Testing basic database operations...'.blue);
        
        // Create a test collection and document
        const testSchema = new mongoose.Schema({
            message: String,
            timestamp: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('ConnectionTest', testSchema);
        
        // Insert test document
        const testDoc = await TestModel.create({
            message: 'CampusVote deployment test - connection successful!'
        });
        
        console.log('✅ Test document created:', testDoc._id.toString().green);
        
        // Read test document
        const foundDoc = await TestModel.findById(testDoc._id);
        console.log('✅ Test document retrieved successfully'.green);
        
        // Clean up test document
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✅ Test document cleaned up'.green);
        
        // Get database stats
        const db = mongoose.connection.db;
        const stats = await db.stats();
        
        console.log('\n📊 Database Information:'.cyan);
        console.log(`Database Name: ${db.databaseName}`.yellow);
        console.log(`Collections: ${stats.collections}`.yellow);
        console.log(`Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`.yellow);
        
        console.log('\n🎉 MongoDB Atlas is ready for CampusVote deployment!'.green.bold);
        
        // Connection string format for deployment
        console.log('\n📋 For deployment, use this connection string format:'.cyan);
        const cleanURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//USERNAME:PASSWORD@');
        console.log(cleanURI.yellow);
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:'.red);
        console.error(error.message.red);
        
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n💡 Common solutions:'.yellow);
            console.log('1. Check your internet connection');
            console.log('2. Verify the connection string is correct');
            console.log('3. Ensure IP address is whitelisted in MongoDB Atlas');
            console.log('4. Check database user credentials');
        }
        
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB'.blue);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message.red);
    process.exit(1);
});

// Run the test
testMongoConnection();