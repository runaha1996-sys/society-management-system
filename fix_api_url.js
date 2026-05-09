const fs = require('fs');
const content = fs.readFileSync('js/script.js', 'utf8');
const fixedContent = "// ==================== AUTH SYSTEM ====================\n" +
  "const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')\n" +
  "  ? `http://${window.location.hostname}:5001/api` \n" +
  "  : 'https://api.rahulpatel.online/api';\n" +
  content.split('\n').slice(4).join('\n');

fs.writeFileSync('js/script.js', fixedContent);
console.log('Improved script.js API_URL logic');
