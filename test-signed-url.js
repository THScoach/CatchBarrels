const fetch = require('node-fetch');

async function testSignedUrl() {
  const videoId = '7d378c29-2077-4d09-af7f-5a61edb86cdf'; // First PENDING video
  
  console.log(`\nTesting signed URL generation for video: ${videoId}\n`);
  
  try {
    // Note: This would need authentication in production
    // For now, just test the endpoint structure
    console.log(`Endpoint: /api/videos/${videoId}/signed-url`);
    console.log('\nThis endpoint requires authentication.');
    console.log('In the browser:');
    console.log('1. Login to the app');
    console.log('2. Open browser console (F12)');
    console.log('3. Run: fetch(`/api/videos/${videoId}/signed-url`).then(r => r.json()).then(console.log)');
    console.log('\nExpected response: { signedUrl: "https://..." }');
  } catch (error) {
    console.error('Error:', error);
  }
}

testSignedUrl();
