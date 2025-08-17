import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';

config();

async function testAuth() {
  console.log('🔐 Testing Twitter OAuth 1.0a Authentication\n');
  console.log('Credentials check:');
  console.log('API Key:', process.env.TWITTER_API_KEY?.substring(0, 10) + '...');
  console.log('Access Token:', process.env.TWITTER_ACCESS_TOKEN?.substring(0, 25) + '...\n');
  
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET_KEY!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });
    
    // Test authentication
    console.log('📊 Verifying credentials...');
    const me = await client.v2.me();
    console.log('✅ SUCCESS! Authenticated as @' + me.data.username);
    console.log('   Name:', me.data.name);
    console.log('   ID:', me.data.id);
    
    // Test posting capability
    console.log('\n🐦 Testing tweet posting...');
    const testTweet = 'throp is online. chaos mode: activated. lowercase: mandatory. we are so back 🌀';
    const tweet = await client.v2.tweet(testTweet);
    console.log('✅ Tweet posted successfully!');
    console.log('   Tweet ID:', tweet.data.id);
    console.log('   View at: https://twitter.com/' + me.data.username + '/status/' + tweet.data.id);
    
  } catch (error: any) {
    console.error('❌ Authentication failed!');
    console.error('Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

testAuth();
