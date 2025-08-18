const fs = require('fs');

// Read the file
let content = fs.readFileSync('web/src/app/page.tsx', 'utf8');

// Fix the API URL logic
content = content.replace(
  /let apiUrl = process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001\/api\/chat';/,
  'let apiUrl = process.env.NEXT_PUBLIC_API_URL;'
);

content = content.replace(
  /\/\/ Use proxy endpoint for all non-direct backend URLs\s*if \(!apiUrl\.includes\('localhost'\) && !apiUrl\.includes\('run\.app'\)\) {/,
  `// Use proxy unless we have a specific backend URL (localhost for dev or run.app for direct)
      if (!apiUrl || (!apiUrl.includes('localhost') && !apiUrl.includes('run.app'))) {`
);

// Remove rating from Message interface
content = content.replace(
  /rating\?: 'fire' \| 'mid' \| 'trash';\s*/g,
  ''
);

// Remove rateMessage function
content = content.replace(
  /const rateMessage = \(messageId: string, rating: 'fire' \| 'mid' \| 'trash'\) => {[\s\S]*?};/,
  '// Message rating functionality removed'
);

// Remove rating buttons section
content = content.replace(
  /\{\/\* Rating buttons for assistant messages \*\/\}[\s\S]*?\{\/\* End rating buttons \*\/\}/,
  '{/* Message reactions removed */}'
);

// Remove the fire responses count line
content = content.replace(
  /\{messages\.filter\(m => m\.rating === 'fire'\)\.length\} 🔥 responses/,
  '{messages.length} messages sent'
);

// Write the file back
fs.writeFileSync('web/src/app/page.tsx', content);
console.log('Frontend fixed!');
