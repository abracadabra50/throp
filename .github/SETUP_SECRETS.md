# 🔑 GitHub Secrets Setup Guide

To enable all GitHub Actions workflows, you need to add the following secrets to your repository.

## 📍 Where to Add Secrets

1. Go to your repository: https://github.com/abracadabra50/throp
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

## 🔐 Required Secrets

### For Railway Deployment

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token for production | Railway Dashboard → Account Settings → Tokens |
| `RAILWAY_PROJECT_ID` | Your Railway project ID | Railway Dashboard → Project Settings → Project ID |
| `RAILWAY_TOKEN_STAGING` | (Optional) Staging environment token | Same as above, for staging project |
| `RAILWAY_PROJECT_ID_STAGING` | (Optional) Staging project ID | Same as above, for staging project |

### For Bot Monitoring

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `ADMIN_API_KEY` | Admin key for API access | Generate: `openssl rand -hex 32` |

### For Twitter Integration (Optional - for testing)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `TWITTER_API_KEY` | Twitter API key | Twitter Developer Portal |
| `TWITTER_API_SECRET_KEY` | Twitter API secret | Twitter Developer Portal |
| `TWITTER_ACCESS_TOKEN` | Access token | Twitter Developer Portal |
| `TWITTER_ACCESS_TOKEN_SECRET` | Access token secret | Twitter Developer Portal |

## 🚀 Quick Setup Script

Run this in your terminal to generate secure keys:

```bash
# Generate Admin API Key
echo "ADMIN_API_KEY: $(openssl rand -hex 32)"

# Generate other random secrets if needed
echo "SESSION_SECRET: $(openssl rand -hex 32)"
```

## ✅ Verification Checklist

After adding secrets, verify:

- [ ] Push to main branch triggers deployment workflow
- [ ] Creating a PR triggers staging deployment
- [ ] Health check workflow can access the deployed bot
- [ ] Docker builds successfully (if using containers)

## 🔄 GitHub Actions That Use These Secrets

1. **deploy.yml** - Uses Railway tokens for deployment
2. **scheduled-check.yml** - Uses ADMIN_API_KEY for health monitoring
3. **release.yml** - Uses Railway tokens for production releases
4. **docker.yml** - Uses GITHUB_TOKEN (automatically provided)

## 📝 Notes

- **GITHUB_TOKEN** is automatically provided by GitHub Actions
- Secrets are encrypted and only exposed to workflows
- Never commit secrets to your repository
- Rotate secrets regularly for security

## 🆘 Troubleshooting

If workflows are failing:

1. Check the Actions tab for error logs
2. Verify secret names match exactly (case-sensitive)
3. Ensure Railway project exists and token is valid
4. Check that your Railway subscription is active

## 🔒 Security Best Practices

1. Use different tokens for staging and production
2. Limit token permissions to minimum required
3. Rotate tokens every 90 days
4. Never share tokens in issues or PRs
5. Use GitHub's secret scanning to detect leaks
