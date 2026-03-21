const http = require('http');

console.log('Sending login request...');
const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, res => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', d => process.stdout.write(d));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({ email: 'test@example.com', password: 'password123' }));
req.end();
