const http = require('http');

const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhlYjU3ZTNjMzA5OTRjNTRjOWFlMjc1Iiwicm9sZSI6ImFkbWluIn0sImlhdCI6MTc2MDI3NDYyOCwiZXhwIjoxNzYwMzYxMDI4fQ.rRP7J83YWIc5tVNJhMlREYCFhTEUEw1mtGT9JBqa1DM';

function getElections() {
    return new Promise((resolve, reject) => {
        console.log('📋 Getting elections...');
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/admin/elections',
            method: 'GET',
            headers: {
                'x-auth-token': ADMIN_TOKEN
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const elections = JSON.parse(data);
                    console.log('📊 Elections found:', elections.length);
                    elections.forEach((election, index) => {
                        console.log(`  ${index + 1}. ${election.title} (${election._id})`);
                        console.log(`     Status: ${election.status}`);
                        console.log(`     Positions: ${election.positions.join(', ')}`);
                    });
                    resolve(elections);
                } else {
                    reject(new Error(`Failed to get elections: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

function getCandidates(electionId) {
    return new Promise((resolve, reject) => {
        console.log('👤 Getting candidates for election:', electionId);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: `/api/admin/candidates?electionId=${electionId}`,
            method: 'GET',
            headers: {
                'x-auth-token': ADMIN_TOKEN
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const candidates = JSON.parse(data);
                    console.log('👥 Candidates found:', candidates.length);
                    
                    candidates.forEach((candidate, index) => {
                        console.log(`  ${index + 1}. ${candidate.userId.name} (${candidate._id})`);
                        console.log(`     Position: ${candidate.position}`);
                        console.log(`     Status: ${candidate.isApproved ? 'Approved' : 'Pending'}`);
                    });
                    
                    resolve(candidates);
                } else {
                    reject(new Error(`Failed to get candidates: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    try {
        const elections = await getElections();
        if (elections.length > 0) {
            const election = elections[0];
            const candidates = await getCandidates(election._id);
            
            console.log('\\n🎯 TEST DATA TO USE:');
            console.log('=====================');
            console.log(`ELECTION_ID: '${election._id}'`);
            if (candidates.length > 0) {
                console.log(`CANDIDATE_ID: '${candidates[0]._id}'`);
                console.log(`CANDIDATE_NAME: '${candidates[0].userId.name}'`);
                console.log(`POSITION: '${candidates[0].position}'`);
            }
            console.log(`ADMIN_TOKEN: '${ADMIN_TOKEN}'`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();