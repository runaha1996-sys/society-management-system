const fs = require('fs');
const content = fs.readFileSync('js/script.js', 'utf8');

let fixedContent = content;

// 1. Fix redirects from index.html to dashboard.html
fixedContent = fixedContent.replace(/window\.location\.href = 'index\.html'/g, "window.location.href = 'dashboard.html'");

// 2. Add success alerts to addMember
fixedContent = fixedContent.replace(
  "fetchMembers();",
  "fetchMembers();\nalert('Member added successfully!');"
);

// 3. Add success alerts to addVisitor
fixedContent = fixedContent.replace(
  "fetchVisitors();",
  "fetchVisitors();\nalert('Visitor added successfully!');"
);

// 4. Add success alerts to addComplaint
fixedContent = fixedContent.replace(
  "fetchComplaints();",
  "fetchComplaints();\nalert('Complaint submitted successfully!');"
);

// 5. Add success alerts to addNotice
fixedContent = fixedContent.replace(
  "fetchNotices();",
  "fetchNotices();\nalert('Notice posted successfully!');"
);

// 6. Add success alerts to addPayment
fixedContent = fixedContent.replace(
  "fetchPayments();",
  "fetchPayments();\nalert('Payment added successfully!');"
);

// 7. Add success alerts to addExpense
fixedContent = fixedContent.replace(
  "fetchExpenses();",
  "fetchExpenses();\nalert('Expense saved successfully!');"
);

fs.writeFileSync('js/script.js', fixedContent);
console.log('Added success alerts and fixed redirects in script.js');
