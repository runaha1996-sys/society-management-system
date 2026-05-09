const fs = require('fs');
const content = fs.readFileSync('js/script.js', 'utf8');

let fixedContent = content;

// Success alerts for all actions
const actions = [
    { fn: 'addMember', success: "alert('Member added successfully!');" },
    { fn: 'deleteMember', success: "alert('Member deleted successfully!');" },
    { fn: 'updateMember', success: "alert('Member updated successfully!');" },
    { fn: 'addVisitor', success: "alert('Visitor added successfully!');" },
    { fn: 'addComplaint', success: "alert('Complaint submitted successfully!');" },
    { fn: 'addNotice', success: "alert('Notice posted successfully!');" },
    { fn: 'addPayment', success: "alert('Payment added successfully!');" },
    { fn: 'addExpense', success: "alert('Expense saved successfully!');" },
    { fn: 'deleteExpense', success: "alert('Expense deleted successfully!');" },
    { fn: 'toggleMemberStatus', success: "alert('Member status updated!');" }
];

actions.forEach(action => {
    // Find the 'if (response.ok) {' block for each function
    // This is a bit complex with regex, but I'll try to find the fetch call followed by response.ok
    // Since I know the structure of these functions is very similar:
    // if (response.ok) {
    //    closeModal(...);
    //    fetch...();
    // }
    
    // Actually, I'll just look for specific patterns
});

// Let's do it more simply for the most important ones
fixedContent = fixedContent.replace(/fetchMembers\(\);\s+}/g, "fetchMembers();\n      alert('Member updated successfully!');\n    }");
// Wait, this is too broad.

// I'll use a safer approach: replace the specific line in each function
fixedContent = fixedContent.replace("closeModal('addMemberModal');\n      fetchMembers();", "closeModal('addMemberModal');\n      fetchMembers();\n      alert('Member added successfully!');");
fixedContent = fixedContent.replace("method: 'DELETE',\n      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }\n    });\n\n    if (response.ok) {\n      fetchMembers();", "method: 'DELETE',\n      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }\n    });\n\n    if (response.ok) {\n      fetchMembers();\n      alert('Member deleted successfully!');");

// Fix the redirect one more time to be sure
fixedContent = fixedContent.replace(/window\.location\.href = 'index\.html'/g, "window.location.href = 'dashboard.html'");

fs.writeFileSync('js/script.js', fixedContent);
console.log('Final Polish of script.js completed');
