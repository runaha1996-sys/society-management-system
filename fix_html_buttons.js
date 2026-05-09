const fs = require('fs');

const mappings = {
    'members.html': [
        { target: 'Save Member', replacement: '<button class="btn btn-primary btn-sm" onclick="addMember()">Save Member</button>' }
    ],
    'complaints.html': [
        { target: 'Submit Complaint', replacement: '<button class="btn btn-primary btn-sm" onclick="addComplaint()">Submit Complaint</button>' }
    ],
    'payments.html': [
        { target: 'Add Payment', replacement: '<button class="btn btn-primary btn-sm" onclick="addPayment()">Add Payment</button>' }
    ],
    'expenses.html': [
        { target: 'Save Expense', replacement: '<button class="btn btn-primary btn-sm" onclick="addExpense()">Save Expense</button>' }
    ],
    'visitors.html': [
        { target: 'Check-in Visitor', replacement: '<button class="btn btn-primary btn-sm" onclick="addVisitor()">Check-in Visitor</button>' }
    ],
    'notices.html': [
        { target: 'Post Notice', replacement: '<button class="btn btn-primary btn-sm" onclick="addNotice()">Post Notice</button>' }
    ]
};

for (const [file, changes] of Object.entries(mappings)) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        changes.forEach(change => {
            // Find the button with that text but no onclick
            const regex = new RegExp('<button class="btn btn-primary btn-sm">' + change.target + '</button>', 'g');
            content = content.replace(regex, change.replacement);
        });
        fs.writeFileSync(file, content);
        console.log(`Fixed buttons in ${file}`);
    }
}
