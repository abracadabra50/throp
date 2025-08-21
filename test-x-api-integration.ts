#!/usr/bin/env ts-node

/**
 * Comprehensive X API Integration Test Suite
 * 
 * This script tests all aspects of X API integration including:
 * - Bearer token format validation
 * - Direct API calls vs library usage
 * - Rate limit monitoring
 * - Backend endpoint integration
 * - Authentication flow validation
 * 
 * Based on investigation findings in X_API_INVESTIGATION_SUMMARY.md
 */

import { TwitterApi } from 'twitter-api-v2';
import fetch from 'node-fetch';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
}

class XAPIIntegrationTester {
  private bearerToken: string;
  private botUserId: string;
  private botUsername: string;
  private backendUrl: string;
  private results: TestResult[] = [];

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || '';
    this.botUserId = process.env.TWITTER_BOT_USER_ID || '';
    this.botUsername = process.env.TWITTER_BOT_USERNAME || '';
    this.backendUrl = process.env.BACKEND_URL || 'https://throp-bot-947985992378.us-central1.run.app';
  }

  private addResult(name: string, success: boolean, message: string, details?: any) {
    this.results.push({ name, success, message, details });
    const status = success ? '✅' : '❌';
    console.log(`${status} ${name}: ${message}`);
    if (details) {
      console.log(`   Details:`, details);
    }
  }

  async testBearerTokenFormat(): Promise<boolean> {
    console.log('\n🔐 Testing Bearer Token Format');
    console.log('=====================================');

    if (!this.bearerToken) {
      this.addResult('Bearer Token Presence', false, 'TWITTER_BEARER_TOKEN environment variable not set');
      return false;
    }

    // Test token format based on investigation findings
    const formatChecks = {
      length: this.bearerToken.length,
      startsWithAAAA: this.bearerToken.startsWith('AAAA'),
      isUrlEncoded: this.bearerToken.includes('%'),
      containsEquals: this.bearerToken.includes('%3D'), // URL-encoded '='
      containsSlash: this.bearerToken.includes('%2F'),  // URL-encoded '/'
    };

    this.addResult('Token Length', formatChecks.length > 100, `Length: ${formatChecks.length}`, formatChecks);
    this.addResult('Token Prefix', formatChecks.startsWithAAAA, 'Should start with AAAA');
    this.addResult('URL Encoding', formatChecks.isUrlEncoded, 'Should contain URL-encoded characters');

    return formatChecks.startsWithAAAA && formatChecks.isUrlEncoded;
  }

  async testDirectAPICall(): Promise<boolean> {
    console.log('\n🌐 Testing Direct X API Calls');
    console.log('===============================');

    try {
      // Test rate limit endpoint (safe and informative)
      const response = await fetch('https://api.twitter.com/1.1/application/rate_limit_status.json', {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'User-Agent': 'throp-bot-integration-test'
        }
      });

      if (response.status === 200) {
        const data = await response.json() as any;
        const endpointCount = Object.keys(data.resources).length;
        
        this.addResult('Rate Limit API', true, `Success - ${endpointCount} endpoint categories available`);
        
        // Check specific endpoints we use
        const mentions = data.resources.statuses?.['/statuses/mentions_timeline'];
        const userLookup = data.resources.users?.['/users/lookup'];
        
        if (mentions) {
          this.addResult('Mentions Rate Limit', true, `${mentions.remaining}/${mentions.limit} remaining`);
        }
        if (userLookup) {
          this.addResult('User Lookup Rate Limit', true, `${userLookup.remaining}/${userLookup.limit} remaining`);
        }

        return true;
      } else {
        const errorText = await response.text();
        this.addResult('Direct API Call', false, `HTTP ${response.status}`, { error: errorText });
        return false;
      }
    } catch (error) {
      this.addResult('Direct API Call', false, `Network error: ${error.message}`);
      return false;
    }
  }

  async testTwitterAPILibrary(): Promise<boolean> {
    console.log('\n📚 Testing twitter-api-v2 Library');
    console.log('==================================');

    try {
      // Use token directly without decoding (key fix from investigation)
      const client = new TwitterApi(this.bearerToken);
      const readClient = client.readOnly;

      // Test rate limits
      const rateLimits = await readClient.v1.getRateLimits();
      this.addResult('Library Rate Limits', true, 'Successfully retrieved rate limits');

      // Test user lookup if we have bot user ID
      if (this.botUserId) {
        try {
          const user = await readClient.v2.user(this.botUserId);
          this.addResult('Library User Lookup', true, `Found user: @${user.data.username}`);
        } catch (userError) {
          if (userError.code === 429) {
            this.addResult('Library User Lookup', true, 'Rate limited (expected)');
          } else {
            this.addResult('Library User Lookup', false, `User lookup failed: ${userError.message}`);
          }
        }
      }

      return true;
    } catch (error) {
      if (error.code === 429) {
        this.addResult('Library Test', true, 'Rate limited (expected during testing)');
        return true;
      } else {
        this.addResult('Library Test', false, `Library error: ${error.message}`);
        return false;
      }
    }
  }

  async testBackendIntegration(): Promise<boolean> {
    console.log('\n🔗 Testing Backend X API Integration');
    console.log('====================================');

    try {
      // Test Twitter diagnostics endpoint
      const diagResponse = await fetch(`${this.backendUrl}/api/twitter/diagnostics`, {
        timeout: 30000
      });

      if (diagResponse.status === 200) {
        const diagData = await diagResponse.json() as any;
        
        this.addResult('Backend Diagnostics', true, 'Diagnostics endpoint responding');
        
        if (diagData.readCapability) {
          this.addResult('Read Capability', true, 'X API read access enabled');
        } else {
          this.addResult('Read Capability', false, 'X API read access disabled');
        }

        if (diagData.writeCapability) {
          this.addResult('Write Capability', true, 'X API write access enabled');
        } else {
          this.addResult('Write Capability', false, 'X API write access disabled');
        }

        // Test mentions endpoint (may be rate limited)
        try {
          const mentionsResponse = await fetch(`${this.backendUrl}/api/mentions`, {
            timeout: 30000
          });

          if (mentionsResponse.status === 200) {
            this.addResult('Backend Mentions', true, 'Mentions endpoint responding');
          } else if (mentionsResponse.status === 429) {
            this.addResult('Backend Mentions', true, 'Rate limited (expected)');
          } else {
            this.addResult('Backend Mentions', false, `HTTP ${mentionsResponse.status}`);
          }
        } catch (mentionsError) {
          this.addResult('Backend Mentions', false, `Network error: ${mentionsError.message}`);
        }

        return true;
      } else {
        this.addResult('Backend Diagnostics', false, `HTTP ${diagResponse.status}`);
        return false;
      }
    } catch (error) {
      this.addResult('Backend Integration', false, `Network error: ${error.message}`);
      return false;
    }
  }

  async runAllTests(): Promise<boolean> {
    console.log('🚀 X API Integration Test Suite');
    console.log('================================');
    console.log(`Backend URL: ${this.backendUrl}`);
    console.log(`Bot User ID: ${this.botUserId || 'Not set'}`);
    console.log(`Bot Username: ${this.botUsername || 'Not set'}`);

    const tests = [
      () => this.testBearerTokenFormat(),
      () => this.testDirectAPICall(),
      () => this.testTwitterAPILibrary(),
      () => this.testBackendIntegration()
    ];

    let allPassed = true;

    for (const test of tests) {
      try {
        const passed = await test();
        if (!passed) allPassed = false;
      } catch (error) {
        console.error(`Test execution error: ${error.message}`);
        allPassed = false;
      }
    }

    // Summary
    console.log('\n📊 Test Summary');
    console.log('================');
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    console.log(`Passed: ${passed}/${total}`);

    if (allPassed) {
      console.log('🎉 All X API integration tests passed!');
    } else {
      console.log('❌ Some X API integration tests failed');
      console.log('\n📋 Failed Tests:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.name}: ${r.message}`);
      });
    }

    return allPassed;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new XAPIIntegrationTester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

export { XAPIIntegrationTester };
