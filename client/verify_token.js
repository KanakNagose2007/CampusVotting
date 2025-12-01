const jwt = require('jsonwebtoken');

const FRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhlYmE4ZTVmMWQ3NzFjOTc2ZWI0ZTIxIiwicm9sZSI6InZvdGVyIn0sImlhdCI6MTc2MDI3NDczMywiZXhwIjoxNzYwMzYxMTMzfQ.TLNUKpHCXgrOOp3ALuuUA5TGCnjjdZsx8Tdves1AMds';

// Decode without verification first
try {
    const decoded = jwt.decode(FRESH_TOKEN);
    console.log('🔓 Decoded token (without verification):');
    console.log(JSON.stringify(decoded, null, 2));
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
        console.log('❌ Token is expired!');
        console.log(`Token expired at: ${new Date(decoded.exp * 1000)}`);
        console.log(`Current time: ${new Date()}`);
    } else {
        console.log('✅ Token is not expired');
        console.log(`Token expires at: ${new Date(decoded.exp * 1000)}`);
    }
    
} catch (error) {
    console.log('❌ Failed to decode token:', error.message);
}

// Try to verify with a common JWT secret (we need to check the .env file)
const JWT_SECRETS_TO_TRY = [
    'your-super-secret-jwt-key-here-change-this-in-production',
    'campusvote_super_secret_key_2024_secure_token',
    'secretkey',
    'default_secret',
    'jwtsecret',
    'your_jwt_secret_key_here'
];

console.log('\\n🔐 Trying to verify with common secrets...');
for (const secret of JWT_SECRETS_TO_TRY) {
    try {
        const verified = jwt.verify(FRESH_TOKEN, secret);
        console.log(`✅ Token verified successfully with secret: ${secret.substring(0, 10)}...`);
        console.log('Verified payload:', JSON.stringify(verified, null, 2));
        break;
    } catch (error) {
        console.log(`❌ Failed with secret ${secret.substring(0, 10)}...: ${error.message}`);
    }
}