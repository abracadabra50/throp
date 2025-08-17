# 🚀 Throp Setup Guide for Non-Developers

This guide will walk you through setting up your Throp Twitter bot step by step, even if you've never coded before!

## 📋 What You'll Need

Before we start, make sure you have:
1. A computer (Windows, Mac, or Linux)
2. A Twitter/X account for your bot
3. A credit card for API services (small charges apply)
4. About 30-60 minutes

## Step 1: Install Required Software

### 1.1 Install Node.js
Node.js is what runs our bot. Think of it as the engine!

1. Go to [nodejs.org](https://nodejs.org/)
2. Click the big green button that says "LTS" (Long Term Support)
3. Download and run the installer
4. Follow the installation wizard (just click "Next" for all options)

**To check it worked:**
- On Windows: Open Command Prompt (search for "cmd")
- On Mac: Open Terminal (search for "Terminal")
- Type `node --version` and press Enter
- You should see something like `v20.11.0`

### 1.2 Install Git (Optional but Recommended)
Git helps us download and update the bot code.

1. Go to [git-scm.com](https://git-scm.com/)
2. Download for your system
3. Run the installer (default options are fine)

## Step 2: Get the Bot Code

### Option A: Using Git (Recommended)
1. Open Terminal/Command Prompt
2. Navigate to where you want the bot:
   - Type `cd Desktop` to put it on your desktop
3. Type this command and press Enter:
   ```
   git clone https://github.com/yourusername/throp.git
   ```
4. Enter the bot folder:
   ```
   cd throp
   ```

### Option B: Download Manually
1. Download the code as a ZIP file
2. Extract it to your Desktop
3. Open Terminal/Command Prompt
4. Type `cd Desktop/throp` and press Enter

## Step 3: Install Bot Dependencies

In your Terminal/Command Prompt (make sure you're in the throp folder):
1. Type this command and press Enter:
   ```
   npm install
   ```
2. Wait for it to finish (might take 2-5 minutes)

## Step 4: Set Up Twitter Developer Account

### 4.1 Create Developer Account
1. Go to [developer.twitter.com](https://developer.twitter.com/)
2. Click "Sign up"
3. Choose "Hobbyist" → "Making a bot"
4. Fill in the application (be honest about making a bot!)
5. Wait for approval (usually instant, sometimes takes a day)

### 4.2 Create Your App
1. Once approved, go to the [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create Project"
   - Name: "Throp Bot" (or whatever you like)
   - Use case: "Making a bot"
3. Click "Create App" under your project
   - App name: Must be unique (try "ThropBot_YourName")

### 4.3 Get Your Keys
⚠️ **IMPORTANT**: Save these somewhere safe! You'll only see them once!

1. You'll see "API Key" and "API Key Secret" - copy these!
2. Click "App settings"
3. Click "Keys and tokens" tab
4. Under "Access Token and Secret":
   - Click "Generate"
   - Copy the "Access Token" and "Access Token Secret"

### 4.4 Set Permissions
1. Click "Settings" → "User authentication settings"
2. Click "Set up"
3. Enable "OAuth 2.0"
4. App permissions: Select "Read and write"
5. Type of App: "Web App"
6. Callback URL: `https://your-app.com/callback` (placeholder)
7. Website URL: Your Twitter profile URL
8. Save

### 4.5 Choose API Plan
1. Go to "Products" → "Twitter API v2"
2. Choose a plan:
   - **Free**: NOT supported (too limited)
   - **Basic** ($100/month): Good for starting
   - **Pro** ($5000/month): For serious bots
3. Enter payment details

## Step 5: Get OpenAI API Key

This gives your bot its "brain"!

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Click your profile (top right) → "View API keys"
4. Click "Create new secret key"
5. Name it "Throp Bot"
6. Copy the key (starts with `sk-...`)
7. Add payment method:
   - Click "Billing" → "Payment methods"
   - Add your card
   - Set a monthly budget (start with $10-20)

## Step 6: Configure Your Bot

### 6.1 Create Configuration File
1. In the throp folder, find the file called `env.example`
2. Make a copy and rename it to `.env` (yes, with the dot!)
   - On Windows: Might need to enable "show file extensions"
   - On Mac: Press Cmd+Shift+. to show hidden files

### 6.2 Edit Configuration
Open `.env` in a text editor (Notepad on Windows, TextEdit on Mac)

Replace the values with your actual keys:

```env
# Twitter Settings (from Step 4)
TWITTER_API_KEY=paste_your_api_key_here
TWITTER_API_SECRET_KEY=paste_your_api_secret_here
TWITTER_ACCESS_TOKEN=paste_your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=paste_your_access_secret_here
TWITTER_BOT_USERNAME=your_bot_username
TWITTER_BOT_USER_ID=your_bot_user_id
TWITTER_API_PLAN=basic

# OpenAI Settings (from Step 5)
OPENAI_API_KEY=paste_your_openai_key_here

# Bot Settings (you can change these!)
MAX_MENTIONS_PER_BATCH=5
MAX_TWEETS_PER_HOUR=20
DRY_RUN=true  # Start with true to test!
```

### 6.3 Find Your Twitter User ID
1. Go to [tweeterid.com](https://tweeterid.com/)
2. Enter your bot's username
3. Copy the number
4. Paste it as `TWITTER_BOT_USER_ID` in your `.env` file

## Step 7: Test Your Bot

Time to see if everything works!

### 7.1 Dry Run Test
1. In Terminal/Command Prompt (in the throp folder)
2. Type and press Enter:
   ```
   npm run dev -- --dry-run
   ```
3. The bot will start but won't actually tweet
4. If you see "Configuration loaded successfully" - it works! 🎉

### 7.2 Process a Specific Tweet (Safe Test)
1. Find a tweet mentioning your bot
2. Copy its ID (the numbers at the end of the URL)
3. Run:
   ```
   npm run dev -- --dry-run -t "paste_tweet_id_here"
   ```

### 7.3 Go Live!
When you're ready to actually start responding:
1. Change `DRY_RUN=false` in your `.env` file
2. Run:
   ```
   npm run dev
   ```

## Step 8: Keep It Running

### Option A: Manual Running
Run the bot whenever you want:
```
npm run dev
```

### Option B: Continuous Mode
Let it run forever, checking every 5 minutes:
```
npm run dev -- --continuous --interval 5
```

### Option C: Cloud Hosting (Advanced)
For 24/7 operation, consider services like:
- Heroku (easy, free tier available)
- DigitalOcean ($5/month)
- AWS (complex but powerful)

## 🎛️ Customising Your Bot

### Change How It Responds
Edit these in your `.env` file:

```env
# How many tweets to process at once (1-10)
MAX_MENTIONS_PER_BATCH=5

# How many tweets per hour (stay under limits!)
MAX_TWEETS_PER_HOUR=20

# Temperature (0.1 = boring, 1.0 = creative)
OPENAI_TEMPERATURE=0.7

# Model (gpt-3.5-turbo is cheaper, gpt-4 is smarter)
OPENAI_MODEL=gpt-3.5-turbo
```

### Monitor Costs
- OpenAI: Check [platform.openai.com/usage](https://platform.openai.com/usage)
- Twitter: Check your developer portal

## ❓ Troubleshooting

### "Command not found" Error
- Make sure you're in the right folder (`cd Desktop/throp`)
- Make sure Node.js is installed (`node --version`)

### "API key invalid" Error
- Double-check you copied the keys correctly
- Make sure there are no extra spaces
- Regenerate keys if needed

### Bot Not Responding to Mentions
- Check the bot username is correct
- Make sure `DRY_RUN=false`
- Check Twitter API plan is active
- Wait 5-10 minutes (Twitter can be slow)

### Rate Limit Errors
- Reduce `MAX_MENTIONS_PER_BATCH`
- Reduce `MAX_TWEETS_PER_HOUR`
- Upgrade Twitter API plan if needed

## 💰 Expected Costs

Monthly estimates for moderate use:
- Twitter API Basic: $100
- OpenAI: $10-50 (depends on usage)
- Hosting (optional): $5-20
- **Total: ~$115-170/month**

## 🆘 Getting Help

1. **Check the logs**: The bot tells you what's wrong!
2. **Read error messages**: They usually explain the problem
3. **Search the error**: Copy error messages into Google
4. **Ask for help**: Create an issue on GitHub
5. **Twitter/X Developer Forum**: [twittercommunity.com](https://twittercommunity.com/)

## 🎯 Next Steps

Once your bot is running:
1. Monitor its responses
2. Adjust temperature and settings
3. Add more features (see README.md)
4. Consider Redis for better performance
5. Set up monitoring alerts

## 📚 Learn More

Want to understand what's happening?
- [Node.js Tutorial](https://nodejs.dev/learn)
- [Twitter API Basics](https://developer.twitter.com/en/docs/basics/getting-started)
- [OpenAI Documentation](https://platform.openai.com/docs)

---

**Remember**: Start small, test everything with dry-run first, and gradually increase your bot's activity. Have fun! 🤖✨
