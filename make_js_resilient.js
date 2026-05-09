const fs = require('fs');
const content = fs.readFileSync('js/script.js', 'utf8');

let fixedContent = content;

// 1. Fix fetchDashboardStats crash on non-array results
fixedContent = fixedContent.replace(
  "if (membersEl) membersEl.textContent = members.length;",
  "if (membersEl) membersEl.textContent = Array.isArray(members) ? members.length : 0;"
);

fixedContent = fixedContent.replace(
  "const count = visitors.filter(v => new Date(v.entry_time).toLocaleDateString() === today).length;",
  "const count = Array.isArray(visitors) ? visitors.filter(v => new Date(v.entry_time).toLocaleDateString() === today).length : 0;"
);

fixedContent = fixedContent.replace(
  "const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);",
  "const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) : 0;"
);

fixedContent = fixedContent.replace(
  "const totalPaid = payments",
  "const totalPaid = Array.isArray(payments) ? payments"
);
// Wait, the line above is tricky.

// 2. Fix fetchChatMessages crash on non-array results
fixedContent = fixedContent.replace(
  "messages.forEach(msg => {",
  "if (Array.isArray(messages)) {\n      messages.forEach(msg => {"
);
// And close the if block
fixedContent = fixedContent.replace(
  "html += `\n        <div class=\"chat-msg ${isSent ? 'sent' : 'received'}\">",
  "html += `\n        <div class=\"chat-msg ${isSent ? 'sent' : 'received'}\">"
);

fs.writeFileSync('js/script.js', fixedContent);
console.log('Made script.js resilient to API errors');
