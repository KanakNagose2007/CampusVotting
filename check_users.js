const http = require('http');

// First let's try to see if there's a public endpoint to check available users
// or let's try common test credentials

const testCredentials = [
    { email: 'admin@test.com', password: 'password123' },
    { email: 'voter@test.com', password: 'password123' },
    { email: 'test@test.com', password: 'password123' },
    { email: 'user@test.com', password: 'password123' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'admin@campus.edu', password: 'admin123' },
    { email: 'student@campus.edu', password: 'student123' }
];

function tryLogin(credentials) {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify(credentials);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.token) {
                            resolve({
                                success: true,
                                credentials,
                                token: parsed.token,
                                user: parsed.user || parsed
                            });
                        } else {
                            resolve({
                                success: false,
                                credentials,
                                error: 'No token in response'
                            });
                        }
                    } catch (e) {
                        resolve({
                            success: false,
                            credentials,
                            error: 'Invalid JSON response'
                        });
                    }
                } else {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            success: false,
                            credentials,
                            status: res.statusCode,
                            error: parsed.error || parsed.message || 'Unknown error'
                        });
                    } catch (e) {
                        resolve({
                            success: false,
                            credentials,
                            status: res.statusCode,
                            error: data || 'Unknown error'
                        });
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                credentials,
                error: error.message
            });
        });
        
        req.write(loginData);
        req.end();
    });
}

async function findValidCredentials() {
    console.log('Testing common credential combinations...\n');
    
    for (let i = 0; i < testCredentials.length; i++) {
        const creds = testCredentials[i];
        console.log(`${i + 1}. Testing ${creds.email} / ${creds.password}...`);
        
        const result = await tryLogin(creds);
        
        if (result.success) {
            console.log('   ✅ SUCCESS!');
            console.log('   Token:', result.token.substring(0, 50) + '...');
            if (result.user) {
                console.log('   User:', JSON.stringify(result.user, null, 2));
            }
            return result;
        } else {
            console.log(`   ❌ Failed: ${result.error} (Status: ${result.status || 'N/A'})`);
        }
    }
    
    return null;
}

findValidCredentials().then(result => {
    if (result) {
        console.log('\n🎉 Found valid credentials!');
        console.log('Email:', result.credentials.email);
        console.log('Password:', result.credentials.password);
        console.log('Token:', result.token);
        
        // Save the token to a file for easy reuse
        const fs = require('fs');
        fs.writeFileSync('fresh_token.txt', result.token);
        console.log('\nToken saved to fresh_token.txt');
        
    } else {
        console.log('\n💥 No valid credentials found. You may need to:');
        console.log('1. Create a test user in the database');
        console.log('2. Check the actual database for existing users');
        console.log('3. Use the registration endpoint first');
    }
    
    process.exit(0);
});