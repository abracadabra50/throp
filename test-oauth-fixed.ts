import { TwitterApi } from 'twitter-api-v2';

async function testFormats() {
  console.log('🔧 Testing OAuth 2.0 Token Formats\n');
  
  const tokens = [
    '1956873492420608000-ZOFwzvl1JPNjCorhUI84N93BsrjZdJ',  // With hyphen
    '1956873492420608000ZOFwzvl1JPNjCorhUI84N93BsrjZdJ',    // Original (no hyphen)
  ];
  
  for (const token of tokens) {
    console.log(`\nTesting token format: ${token.substring(0, 25)}...`);
    
    try {
      const client = new TwitterApi(token);
      const me = await client.v2.me();
      console.log(`✅ SUCCESS! Authenticated as @${me.data.username}`);
      
      // Try posting if auth works
      const tweet = await client.v2.tweet('throp oauth test - chaos mode ready 🌀');
      console.log(`   Tweet posted! ID: ${tweet.data.id}`);
      console.log(`   View at: https://twitter.com/${me.data.username}/status/${tweet.data.id}`);
      break; // Stop on success
      
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}`);
      if (error.data?.detail) {
        console.log(`   Details: ${error.data.detail}`);
      }
    }
  }
}

testFormats();
