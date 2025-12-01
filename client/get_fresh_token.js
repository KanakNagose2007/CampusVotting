const http = require('http');

// Test login to get fresh token
function getAccessToken() {
    return new Promise((resolve, reject) => {
        console.log('🔑 Getting fresh access token...');
        
        // Use seeded voter credentials for voting test
        const loginData = JSON.stringify({
            email: 'alice@example.com',
            password: 'password123'
        });
        
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
                    const response = JSON.parse(data);
                    console.log('✅ Login successful');
                    console.log('🎫 Token:', response.token);
                    console.log('👤 User:', {
                        name: response.user.name,
                        email: response.user.email,
                        role: response.user.role,
                        id: response.user._id
                    });
                    resolve(response.token);
                } else {
                    console.log('❌ Login failed:', {
                        status: res.statusCode,
                        response: data
                    });
                    reject(new Error(`Login failed: ${res.statusCode} - ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
}

// Run the test
getAccessToken()
    .then(token => {
        console.log('\\n✅ Fresh token obtained successfully!');
        console.log('Copy this token for your test:');
        console.log(`'${token}'`);
    })
    .catch(error => {
        console.error('❌ Failed to get token:', error.message);
    });