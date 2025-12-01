const http = require('http');

function testVote() {
    return new Promise((resolve, reject) => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhlYmE0MmMxOTI1OTJkMWFjY2VmZjNmIiwicm9sZSI6InZvdGVyIn0sImlhdCI6MTc2MDI3MzQ1MiwiZXhwIjoxNzYwMzU5ODUyfQ.P78z_S-yYHf30GZm-PArLMzgyT1zu0tI1-IirL9PZhE'; // Fresh token from registration
        
        const voteData = JSON.stringify({
            electionId: '68eb8eeeef13a7b7be3fad3d', // Election that has the candidate
            candidateId: '68eb922d3abd044bda8a9618', // Updated candidate ID from logs
            position: 'Secretary'
        });
        
        console.log('Testing vote with corrected election and candidate ID...');
        console.log('Vote payload:', voteData);
        console.log('Watch the server console for detailed logs...');
        
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
                console.log('\nServer Response:');
                console.log('Status:', res.statusCode);
                console.log('Headers:', res.headers);
                console.log('Body:', data);
                
                if (res.statusCode === 200) {
                    console.log('\n✅ Vote successful!');
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (e) {
                        console.log('Response is not valid JSON:', data);
                        resolve(data);
                    }
                } else {
                    console.log('\n❌ Vote failed with status:', res.statusCode);
                    try {
                        const parsed = JSON.parse(data);
                        console.log('Error details:', parsed);
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
                    } catch (e) {
                        console.log('Raw error response:', data);
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });
        
        req.write(voteData);
        req.end();
    });
}

console.log('Starting vote test...');
console.log('Make sure to check the server console for detailed logs!');

testVote().then(result => {
    console.log('\nTest completed successfully!');
    process.exit(0);
}).catch(error => {
    console.log('\nTest failed:', error.message);
    process.exit(1);
});
