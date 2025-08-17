import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';

config();

async function testOAuth2() {
  try {
    console.log('🔑 Testing OAuth 2.0 Authentication...\n');
    
    // Display credentials (masked)
    console.log('API Key:', process.env.TWITTER_API_KEY?.substring(0, 10) + '...');
    console.log('Access Token:', process.env.TWITTER_ACCESS_TOKEN?.substring(0, 30) + '...');
    
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET_KEY!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    // Try to get user info
    console.log('\n📋 Getting authenticated user info...');
    const me = await client.v2.me();
    console.log('✅ Successfully authenticated!');
    console.log('   Username: @' + me.data.username);
    console.log('   Name:', me.data.name);
    console.log('   ID:', me.data.id);
    
    // Test posting
    console.log('\n🧪 Testing tweet posting...');
    const testTweet = await client.v2.tweet('throp online. chaos mode: activated. i am throp not perplexity. powered by perplexity tho. 🌀');
    console.log('✅ Tweet posted successfully!');
    console.log('   Tweet ID:', testTweet.data.id);
    console.log('   View at: https://twitter.com/askthrop/status/' + testTweet.data.id);
    
  } catch (error: any) {
    console.error('❌ Authentication failed:', error.message);
    if (error.data) {
      console.error('   Error details:', JSON.stringify(error.data, null, 2));
    }
    if (error.code === 401) {
      console.log('\n⚠️  401 Unauthorized - Troubleshooting:');
      console.log('1. Double-check all 4 credentials are correct');
      console.log('2. Make sure tokens haven\'t been revoked');
      console.log('3. Ensure app has proper OAuth 2.0 setup');
      console.log('4. Check if tokens match the app (not from different app)');
    }
  }
}

testOAuth2();
