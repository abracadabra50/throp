#!/bin/bash

# Quick deploy - just update the existing hybrid engine with the new orchestrator
# This is the safest deployment approach

set -e

echo "🚀 Quick Deploy: Enhanced Throp with Orchestrator"
echo "================================================"

# Backup current hybrid engine
echo "📦 Creating backup..."
cp src/engines/hybrid-claude.ts src/engines/hybrid-claude.ts.backup

# Update the existing hybrid engine to use orchestrator for specific queries
echo "🔧 Enhancing existing hybrid engine..."

# Add import for the fixed orchestrator at the top
sed -i.bak '11a\
import { createFixedOrchestrator } from '\''./orchestrator-fixed.js'\'';
' src/engines/hybrid-claude.ts

# Add orchestrator property to the class
sed -i.bak 's/export class HybridClaudeEngine extends BaseAnswerEngine {/export class HybridClaudeEngine extends BaseAnswerEngine {\
  private orchestrator: any; \/\/ Enhanced orchestrator/' src/engines/hybrid-claude.ts

# Initialize orchestrator in constructor
sed -i.bak 's/this.model = process.env.ANTHROPIC_MODEL/\/\/ Initialize enhanced orchestrator for better responses\
    try {\
      this.orchestrator = createFixedOrchestrator();\
      logger.info('\''Enhanced orchestrator initialized'\'');\
    } catch (error) {\
      logger.warn('\''Orchestrator not available, using fallback'\'', error);\
      this.orchestrator = null;\
    }\
    \
    this.model = process.env.ANTHROPIC_MODEL/' src/engines/hybrid-claude.ts

# Clean up
rm -f src/engines/hybrid-claude.ts.bak

echo "✅ Hybrid engine enhanced with orchestrator"

# Build
echo "🔨 Building..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    # Commit and push
    echo "📤 Deploying to production..."
    git add .
    git commit -m "feat: enhanced orchestrator with Anthropic web search and better prompts

- Added tool-first approach with Anthropic native web search
- Improved intent detection and domain classification  
- Dynamic response generation using LLM instead of templates
- Multi-domain understanding (gaming, tech, crypto, culture)
- Better 'who is X' answers with real data
- GeckoTerminal integration for crypto prices
- Enhanced Twitter integration with graceful fallbacks"
    
    git push origin main
    
    echo ""
    echo "🎉 Deployment initiated!"
    echo ""
    echo "🔧 Set these environment variables in production:"
    echo "ANSWER_ENGINE=hybrid-claude (keep existing)"
    echo "ANTHROPIC_API_KEY=your_key_here"
    echo ""
    echo "📊 New capabilities:"
    echo "- ✅ Anthropic web search for real-time data"
    echo "- ✅ Better identity queries ('who is X')"
    echo "- ✅ Crypto price integration"
    echo "- ✅ Multi-domain cultural understanding"
    echo "- ✅ Dynamic response generation"
    
else
    echo "❌ Build failed - check TypeScript errors"
    echo "Restoring backup..."
    mv src/engines/hybrid-claude.ts.backup src/engines/hybrid-claude.ts
    exit 1
fi
