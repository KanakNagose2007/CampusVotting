const http = require('http');

function register() {
    return new Promise((resolve, reject) => {
        const registrationData = JSON.stringify({
            name: 'Test Voter',
            email: 'testvoter2024@example.com',
            password: 'testpassword123',
            rollNo: 'TV2024001',
            studentId: 'TV2024001', // Adding studentId as required
            branch: 'Computer Science',
            year: 3,
            role: 'voter'
        });
        
        console.log('Registering new test user...');
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(registrationData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('\nRegistration Response:');
                console.log('Status:', res.statusCode);
                console.log('Body:', data);
                
                if (res.statusCode === 201 || res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log('✅ Registration successful!');
                        resolve(parsed);
                    } catch (e) {
                        console.log('❌ Invalid JSON response:', data);
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    console.log('❌ Registration failed with status:', res.statusCode);
                    try {
                        const parsed = JSON.parse(data);
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
                    } catch (e) {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });
        
        req.write(registrationData);
        req.end();
    });
}

function login(email, password) {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            email: email,
            password: password
        });
        
        console.log('\nLogging in with new credentials...');
        
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
                console.log('\nLogin Response:');
                console.log('Status:', res.statusCode);
                console.log('Body:', data);
                
                if (res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.token) {
                            console.log('\n✅ Login successful!');
                            console.log('Token:', parsed.token.substring(0, 50) + '...');
                            // Decode the JWT payload
                            const payload = JSON.parse(Buffer.from(parsed.token.split('.')[1], 'base64').toString());
                            console.log('User ID:', payload.user.id);
                            console.log('Expires:', new Date(payload.exp * 1000));
                            resolve(parsed.token);
                        } else {
                            reject(new Error('No token in response'));
                        }
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    try {
                        const parsed = JSON.parse(data);
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
                    } catch (e) {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(loginData);
        req.end();
    });
}

function testVote(token) {
    return new Promise((resolve, reject) => {
        const voteData = JSON.stringify({
            electionId: '68eb8eeeef13a7b7be3fad3d',
            candidateId: '68eb922d3abd044bda8a9618',
            position: 'Secretary'
        });
        
        console.log('\n--- Testing vote with fresh token ---');
        console.log('Vote payload:', voteData);
        console.log('Watch the server console for detailed logs!');
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/voting/cast-vote',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
                'Content-Length': Buffer.byteLength(voteData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('\nVote Response:');
                console.log('Status:', res.statusCode);
                console.log('Body:', data);
                
                if (res.statusCode === 200) {
                    console.log('\n✅ Vote successful!');
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    console.log('\n❌ Vote failed with status:', res.statusCode);
                    try {
                        const parsed = JSON.parse(data);
                        console.log('Error details:', parsed);
                        reject(new Error(`Vote failed: ${JSON.stringify(parsed)}`));
                    } catch (e) {
                        console.log('Raw error:', data);
                        reject(new Error(`Vote failed: ${data}`));
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(voteData);
        req.end();
    });
}

async function runCompleteTest() {
    try {
        console.log('🚀 Starting complete registration and voting test...\n');
        
        // Step 1: Register new user
        const regResult = await register();
        
        // Step 2: Login with new user
        const token = await login('testvoter2024@example.com', 'testpassword123');
        
        // Step 3: Test voting
        const voteResult = await testVote(token);
        
        console.log('\n🎉 Complete test successful!');
        console.log('Vote result:', voteResult);
        
        // Save token for future use
        const fs = require('fs');
        fs.writeFileSync('fresh_token.txt', token);
        console.log('\nToken saved to fresh_token.txt');
        
        process.exit(0);
    } catch (error) {
        console.log('\n💥 Test failed:', error.message);
        process.exit(1);
    }
}

runCompleteTest();
