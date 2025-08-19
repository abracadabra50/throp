# CI/CD Pipeline Fix Documentation

## Issues Found and Fixed (2025-08-19)

### Problems Identified

1. **Frontend API Route Tests Failing**
   - The smoke tests were trying to curl `https://throp.ai/api/trending-prompts`
   - We had removed all API routes from the frontend
   - Frontend now calls backend directly

2. **NPM Install Failures**
   - React 18.3.1 and Next.js 15.4.7 have peer dependency conflicts
   - `npm ci` was failing without `--legacy-peer-deps` flag

3. **Missing GitHub Secrets**
   - Workflows require these secrets to be set:
     - `GCP_SERVICE_ACCOUNT_KEY`
     - `NETLIFY_AUTH_TOKEN`
     - `NETLIFY_SITE_ID`

### Fixes Applied

1. **Updated Test Endpoints**
   - Changed frontend test from `/api/trending-prompts` to `/.netlify/functions/chat-proxy`
   - This matches the actual architecture where frontend uses Netlify functions

2. **Fixed NPM Commands**
   - Added `--legacy-peer-deps` to all `npm ci` and `npm install` commands
   - Added fallback from `npm ci` to `npm install` for robustness

3. **Workflow Files Updated**
   - `.github/workflows/deploy.yml`
   - `.github/workflows/deploy-gcp.yml`
   - `.github/workflows/code-quality.yml`

### Required GitHub Secrets

To make the CI/CD pipeline work, you need to add these secrets in GitHub:

1. **GCP_SERVICE_ACCOUNT_KEY**
   - Go to GCP Console > IAM & Admin > Service Accounts
   - Create or use existing service account with Cloud Run Admin permissions
   - Create JSON key and copy entire contents
   - Add as GitHub secret

2. **NETLIFY_AUTH_TOKEN**
   - Get from Netlify: User Settings > Applications > Personal Access Tokens
   - Create new token with full permissions
   - Add as GitHub secret

3. **NETLIFY_SITE_ID**
   - Get from Netlify dashboard for your site
   - Site ID: `a89fc99c-b8ba-48f6-862a-98a443a99890`
   - Add as GitHub secret

### Testing the Fix

The CI/CD pipeline should now:
1. ✅ Build backend successfully
2. ✅ Build frontend with React 18/Next.js 15 compatibility
3. ✅ Deploy to GCP Cloud Run
4. ✅ Deploy to Netlify
5. ✅ Run smoke tests against correct endpoints

### Current Architecture

```
Frontend (Netlify)          Backend (GCP Cloud Run)
├── throp.ai               ├── /api/chat
├── /.netlify/functions    ├── /api/hot-takes
│   └── chat-proxy ────────┤── /api/trending-prompts
└── Direct API calls ──────┘── /api/status
```

The frontend no longer has API routes - it either:
- Uses the Netlify function proxy for chat
- Calls the backend directly for hot-takes and trending prompts
