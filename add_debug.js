const fs = require('fs');
const content = fs.readFileSync('js/script.js', 'utf8');

// Add logging to help debug connection issues
let fixedContent = content.replace(
  'try {',
  'console.log("Attempting login to:", `${API_URL}/auth/login`);\ntry {'
);

fixedContent = fixedContent.replace(
  '} catch (error) {',
  '} catch (error) {\nconsole.error("Login Fetch Error:", error);'
);

fs.writeFileSync('js/script.js', fixedContent);
console.log('Added debug logging to script.js');
