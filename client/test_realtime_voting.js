const http = require('http');
const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:5000';
const FRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhlYmE4ZTVmMWQ3NzFjOTc2ZWI0ZTIxIiwicm9sZSI6InZvdGVyIn0sImlhdCI6MTc2MDI3NTA2OSwiZXhwIjoxNzYwMzYxNDY5fQ.pCGsYykXnPhMrKoW5_QTcIIXPi9QCJy7KxiiAFqIV3E';
const VOTE_DATA = {
    electionId: '68eba8e5f1d771c976eb4e25',
    candidateId: '68eba8e5f1d771c976eb4e2b',
    position: 'President'
};

console.log('🚀 Starting comprehensive real-time voting test...\n');

// Step 1: Setup WebSocket connection to listen for real-time events
function setupWebSocketListener() {
    return new Promise((resolve, reject) => {
        console.log('📡 Setting up WebSocket connection...');
        
        const socket = io(SERVER_URL, {
            auth: {
                token: FRESH_TOKEN
            },
            transports: ['websocket'],
            timeout: 10000
        });
        
        const events = {
            connected: false,
            vote_cast: null,
            live_results_update: null
        };
        
        socket.on('connect', () => {
            console.log('✅ WebSocket connected successfully');
            events.connected = true;
            
            // Join the election room to receive updates
            socket.emit('join_election', VOTE_DATA.electionId);
            console.log('🏛️ Joined election room:', VOTE_DATA.electionId);
            
            // Subscribe to live results if admin (this user is a voter, but we'll still try)
            socket.emit('subscribe_live_results', VOTE_DATA.electionId);
            console.log('📊 Subscribed to live results for election:', VOTE_DATA.electionId);
            
            resolve({ socket, events });
        });
        
        socket.on('connect_error', (error) => {
            console.log('❌ WebSocket connection error:', error.message);
            reject(error);
        });
        
        socket.on('vote_cast', (data) => {
            console.log('🗳️  Received vote_cast event:', {
                electionId: data.electionId,
                totalVotes: data.totalVotes,
                turnoutPercentage: data.turnoutPercentage,
                timestamp: data.timestamp
            });
            events.vote_cast = data;
        });
        
        socket.on('live_results_update', (data) => {
            console.log('📊 Received live_results_update event:', {
                electionId: data.electionId,
                totalVotes: data.totalVotes,
                turnoutPercentage: data.turnoutPercentage,
                resultsCount: Object.keys(data.results || {}).length,
                lastUpdated: data.lastUpdated
            });
            events.live_results_update = data;
        });
        
        socket.on('turnout_milestone', (data) => {
            console.log('🎉 Received turnout_milestone event:', {
                electionId: data.electionId,
                milestone: data.milestone,
                currentTurnout: data.currentTurnout
            });
        });
    });
}

// Step 2: Get live results before voting
function getLiveResults() {
    return new Promise((resolve, reject) => {
        console.log('📈 Getting live results before voting...');
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: `/api/analytics/live/${VOTE_DATA.electionId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': FRESH_TOKEN
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const results = JSON.parse(data);
                    console.log('📊 Current live results:', {
                        totalVotes: results.totalVotes,
                        turnoutPercentage: results.turnoutPercentage,
                        positions: Object.keys(results.results || {})
                    });
                    resolve(results);
                } else {
                    reject(new Error(`Failed to get live results: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

// Step 3: Cast a vote
function castVote() {
    return new Promise((resolve, reject) => {
        console.log('🗳️  Casting vote...');
        
        const votePayload = JSON.stringify(VOTE_DATA);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/voting/cast-vote',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': FRESH_TOKEN,
                'Content-Length': Buffer.byteLength(votePayload)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(data);
                    console.log('✅ Vote cast successfully:', {
                        message: result.message,
                        voteId: result.vote._id,
                        turnoutPercentage: result.turnoutPercentage
                    });
                    resolve(result);
                } else {
                    console.log('❌ Vote failed:', {
                        status: res.statusCode,
                        response: data
                    });
                    reject(new Error(`Vote failed: ${res.statusCode} - ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(votePayload);
        req.end();
    });
}

// Step 4: Wait for WebSocket events and verify updates
function waitForWebSocketUpdates(events, timeout = 5000) {
    return new Promise((resolve) => {
        console.log('⏳ Waiting for WebSocket events...');
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            if (events.vote_cast || events.live_results_update || elapsed >= timeout) {
                clearInterval(checkInterval);
                
                console.log('📡 WebSocket events received:', {
                    vote_cast: !!events.vote_cast,
                    live_results_update: !!events.live_results_update,
                    elapsed: elapsed + 'ms'
                });
                
                resolve(events);
            }
        }, 100);
    });
}

// Step 5: Get updated live results
function getUpdatedLiveResults() {
    return new Promise((resolve, reject) => {
        console.log('📈 Getting updated live results after voting...');
        
        setTimeout(() => {
            getLiveResults()
                .then(resolve)
                .catch(reject);
        }, 1000); // Wait 1 second to ensure updates are processed
    });
}

// Main test function
async function runCompleteTest() {
    try {
        // Step 1: Setup WebSocket connection
        const { socket, events } = await setupWebSocketListener();
        
        // Step 2: Get initial live results
        const initialResults = await getLiveResults();
        
        // Step 3: Cast vote
        const voteResult = await castVote();
        
        // Step 4: Wait for WebSocket events
        const updatedEvents = await waitForWebSocketUpdates(events);
        
        // Step 5: Get updated live results
        const finalResults = await getUpdatedLiveResults();
        
        // Step 6: Compare results and validate real-time updates
        console.log('\\n🔍 ANALYSIS:');
        console.log('=====================================');
        
        console.log('📊 Vote Count Changes:');
        console.log(`   Before: ${initialResults.totalVotes} votes`);
        console.log(`   After:  ${finalResults.totalVotes} votes`);
        console.log(`   Change: ${finalResults.totalVotes - initialResults.totalVotes > 0 ? '✅ Increased' : '❌ No change'}`);
        
        console.log('\\n📡 WebSocket Events:');
        console.log(`   vote_cast event: ${updatedEvents.vote_cast ? '✅ Received' : '❌ Not received'}`);
        console.log(`   live_results_update: ${updatedEvents.live_results_update ? '✅ Received' : '❌ Not received'}`);
        
        console.log('\\n🎯 Turnout Changes:');
        console.log(`   Before: ${initialResults.turnoutPercentage}%`);
        console.log(`   After:  ${finalResults.turnoutPercentage}%`);
        
        // Check specific candidate vote count
        const candidateVotesBefore = initialResults.results?.President?.find(c => c.candidateId === VOTE_DATA.candidateId)?.votes || 0;
        const candidateVotesAfter = finalResults.results?.President?.find(c => c.candidateId === VOTE_DATA.candidateId)?.votes || 0;
        
        console.log('\n👤 Candidate Specific:');
        console.log(`   Bob Voter votes before: ${candidateVotesBefore}`);
        console.log(`   Bob Voter votes after:  ${candidateVotesAfter}`);
        console.log(`   Vote registered: ${candidateVotesAfter > candidateVotesBefore ? '✅ Yes' : '❌ No'}`);
        
        // Overall assessment
        const realTimeWorking = updatedEvents.vote_cast || updatedEvents.live_results_update;
        const voteCountUpdated = finalResults.totalVotes > initialResults.totalVotes;
        const candidateVoteUpdated = candidateVotesAfter > candidateVotesBefore;
        
        console.log('\\n🏆 OVERALL ASSESSMENT:');
        console.log('=====================================');
        console.log(`Real-time updates: ${realTimeWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
        console.log(`Vote counting: ${voteCountUpdated ? '✅ WORKING' : '❌ NOT WORKING'}`);
        console.log(`Candidate tracking: ${candidateVoteUpdated ? '✅ WORKING' : '❌ NOT WORKING'}`);
        
        if (realTimeWorking && voteCountUpdated && candidateVoteUpdated) {
            console.log('\\n🎉 SUCCESS: Complete real-time voting system is FULLY FUNCTIONAL!');
        } else {
            console.log('\\n⚠️  PARTIAL SUCCESS: Some components need attention.');
        }
        
        // Cleanup
        socket.disconnect();
        process.exit(0);
        
    } catch (error) {
        console.error('\\n💥 Test failed:', error.message);
        process.exit(1);
    }
}

// Start the test
runCompleteTest();