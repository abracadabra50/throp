const fs = require('fs');

// Read the file
let content = fs.readFileSync('web/src/app/page.tsx', 'utf8');

// Add better error handling for response.ok check
content = content.replace(
  /if \(!response\.ok\) {\s*throw new Error\('Failed to get response'\);\s*}/,
  `if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error response body:', errorText);
        throw new Error(\`Failed to get response: \${response.status} \${response.statusText}\`);
      }`
);

// Add better error logging in catch block
content = content.replace(
  /} catch \(error\) {\s*console\.error\('Error:', error\);\s*let errorMessage = "uhhhh my brain broke 🍊💥 ";\s*if \(error instanceof Error\) {\s*if \(error\.message\.includes\('fetch'\)\) {\s*errorMessage \+= "cant connect to the api\.\.\. is it running on port 3001\?";\s*} else {\s*errorMessage \+= `error: \$\{error\.message\}`;\s*}\s*} else {\s*errorMessage \+= "something went wrong idk";\s*}/,
  `} catch (error) {
      console.error('Chat error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      
      let errorMessage = "uhhhh my brain broke 🍊💥 ";
      
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage += "cant connect to the api... network issue maybe?";
        } else if (error.message.includes('timeout')) {
          errorMessage += "request timed out... backend too slow?";
        } else {
          errorMessage += \`error: \${error.message}\`;
        }
      } else {
        errorMessage += "something went wrong idk";
      }`
);

// Write the file back
fs.writeFileSync('web/src/app/page.tsx', content);
console.log('Error handling improved!');
