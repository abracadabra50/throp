import { TwitterApi } from 'twitter-api-v2';

async function testAllMethods() {
  console.log('🔐 Testing All Authentication Methods\n');
  
  // Your credentials
  const creds = {
    clientId: 'YjBmOWgycW9zaXNCWnRIck1jajQ6MTpjaQ',
    clientSecret: 'O1uFR6rWcnUXaVa7ljmM40Ux-DSdg4Twfh5Qn8JPM3Wn6uoE43',
    accessToken: '1956873492420608000ZOFwzvl1JPNjCorhUI84N93BsrjZdJ',
    accessSecret: 'G9ykD5BML2mw9I1U0t92dK5ZEQDbDV5BGIvU4Kta91oXf',
    // Try with hyphen too
    accessTokenWithHyphen: '1956873492420608000-ZOFwzvl1JPNjCorhUI84N93BsrjZdJ',
  };
  
  const tests = [
    {
      name: 'OAuth 1.0a with Client ID as API Key',
      client: () => new TwitterApi({
        appKey: creds.clientId,
        appSecret: creds.clientSecret,
        accessToken: creds.accessToken,
        accessSecret: creds.accessSecret,
      }),
    },
    {
      name: 'OAuth 1.0a with hyphenated token',
      client: () => new TwitterApi({
        appKey: creds.clientId,
        appSecret: creds.clientSecret,
        accessToken: creds.accessTokenWithHyphen,
        accessSecret: creds.accessSecret,
      }),
    },
    {
      name: 'OAuth 2.0 Bearer Token (App-Only)',
      client: () => new TwitterApi(creds.clientId),
    },
    {
      name: 'OAuth 2.0 with access token',
      client: () => new TwitterApi(creds.accessToken),
    },
  ];
  
  for (const test of tests) {
    console.log(`\n📝 Testing: ${test.name}`);
    try {
      const client = test.client();
      const me = await client.v2.me();
      console.log(`✅ SUCCESS! Authenticated as @${me.data.username}`);
      
      // Try posting
      const tweet = await client.v2.tweet('throp test tweet - chaos mode initialized 🌀');
      console.log(`   Tweet posted! ID: ${tweet.data.id}`);
      console.log(`   https://twitter.com/${me.data.username}/status/${tweet.data.id}`);
      return; // Exit on success
      
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message?.substring(0, 60)}...`);
    }
  }
  
  console.log('\n⚠️  None of the methods worked.');
  console.log('\nPossible solutions:');
  console.log('1. The credentials might be for a different app');
  console.log('2. You may need to regenerate tokens with Read+Write permissions');
  console.log('3. Visit: https://developer.twitter.com/en/apps');
}

testAllMethods();
