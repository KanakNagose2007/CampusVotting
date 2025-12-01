const io = require('socket.io-client');

const FRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhlYmE4ZTVmMWQ3NzFjOTc2ZWI0ZTIxIiwicm9sZSI6InZvdGVyIn0sImlhdCI6MTc2MDI3NTA2OSwiZXhwIjoxNzYwMzYxNDY5fQ.pCGsYykXnPhMrKoW5_QTcIIXPi9QCJy7KxiiAFqIV3E';

console.log('🔧 Debug WebSocket Connection');
console.log('Token:', FRESH_TOKEN);

const socket = io('http://localhost:5000', {
    auth: {
        token: FRESH_TOKEN
    },
    transports: ['websocket'],
    timeout: 10000,
    forceNew: true
});

socket.on('connect', () => {
    console.log('✅ WebSocket connected successfully!');
    console.log('Socket ID:', socket.id);
    socket.disconnect();
    process.exit(0);
});

socket.on('connect_error', (error) => {
    console.log('❌ WebSocket connection error:', error);
    console.log('Error message:', error.message);
    console.log('Error type:', error.type);
    console.log('Error description:', error.description);
    process.exit(1);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket disconnected:', reason);
});

// Timeout fallback
setTimeout(() => {
    console.log('⏰ Connection timeout after 15 seconds');
    process.exit(1);
}, 15000);