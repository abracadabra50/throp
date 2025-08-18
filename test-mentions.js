const https = require('https');

const options = {
  hostname: 'api.twitter.com',
  path: '/2/users/1956873492420608000/mentions?max_results=2',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAFJw3gEAAAAAPFfvRbR%2BpS9VHocttsU4cyWZxY4%3DrSkpptB35zDiYJygoriFTNmrRF9ViieZyNOGfPDrDAIzrqbuL7'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Mentions found:', json.data ? json.data.length : 0);
    if (json.errors) console.log('Errors:', json.errors);
  });
});

req.on('error', (e) => console.error('Error:', e));
req.end();
