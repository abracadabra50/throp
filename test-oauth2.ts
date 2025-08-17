import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';

config();

async function testOAuth2() {
  console.log('🔐 Testing OAuth 2.0 Authentication\n');
  console.log('Credentials loaded:');
  console.log('API Key:', process.env.TWITTER_API_KEY?.substring(0, 10) + '...');
  console.log('Access Token:', process.env.TWITTER_ACCESS_TOKEN?.substring(0, 20) + '...');
  
  try {
    // OAuth 2.0 User Context (using the full access token)
    const client = new TwitterApi(process.env.TWITTER_ACCESS_TOKEN!);
    
    // Test authentication
    console.log('\n📊 Verifying credentials...');
    const me = await client.v2.me();
    console.log('✅ Authenticated as:', me.data.username);
    console.log('   Name:', me.data.name);
    console.log('   ID:', me.data.id);
    
    // Try posting
    console.log('\n🐦 Attempting to post tweet...');
    const tweet = await client.v2.tweet('throp test: oauth2 credentials working 🌀');
    console.log('✅ Tweet posted successfully!');
    console.log('   ID:', tweet.data.id);
    console.log('   View at: https://twitter.com/askthrop/status/' + tweet.data.id);
    
  } catch (error: any) {
    console.error('\n❌ Authentication failed:', error.message);
    
    if (error.data) {
      console.log('\n📋 Error Details:');
      console.log(JSON.stringify(error.data, null, 2));
    }
    
    if (error.code === 401) {
      console.log('\n⚠️  401 Unauthorized - Possible issues:');
      console.log('1. Access token may be invalid or expired');
      console.log('2. Format might be incorrect (check for extra spaces)');
      console.log('3. Token might need "Read and Write" scope');
      console.log('4. Try regenerating tokens at https://developer.twitter.com/en/apps');
    }
  }
}

testOAuth2();
