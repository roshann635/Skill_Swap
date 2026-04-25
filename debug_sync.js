const https = require('https');

const data = JSON.stringify({
  clerkId: "debug_user_" + Date.now(),
  name: "Debug User",
  email: "debug@example.com"
});

const options = {
  hostname: 'skill-swap-lhy0.onrender.com',
  port: 443,
  path: '/api/users/sync',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
