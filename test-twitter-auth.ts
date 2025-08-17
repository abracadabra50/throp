import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';

config();

async function testAuth() {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET_KEY!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    // Test authentication
    console.log('Testing Twitter authentication...\n');
    
    // Get current user
    const me = await client.v2.me();
    console.log('✅ Authenticated as:', me.data.username);
    console.log('   Name:', me.data.name);
    console.log('   ID:', me.data.id);
    
    // Check rate limits
    const limits = await client.v2.userByUsername('throp');
    console.log('\n📊 Rate limit status:');
    console.log('   Remaining:', client.rateLimit?.remaining);
    console.log('   Limit:', client.rateLimit?.limit);
    
    // Try a test tweet with write permissions check
    console.log('\n🧪 Testing write permissions...');
    const testTweet = await client.v2.tweet('test tweet from throp - lowercase chaos activated 🌀');
    console.log('✅ Successfully posted test tweet!');
    console.log('   Tweet ID:', testTweet.data.id);
    console.log('   View at: https://twitter.com/throp/status/' + testTweet.data.id);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('   Details:', JSON.stringify(error.data, null, 2));
    }
    if (error.code === 403) {
      console.log('\n⚠️  403 Forbidden - Possible causes:');
      console.log('1. App needs to have read AND write permissions');
      console.log('2. Check app settings at https://developer.twitter.com/en/apps');
      console.log('3. May need to regenerate access tokens after changing permissions');
      console.log('4. Account may need to complete verification');
    }
  }
}

testAuth();
