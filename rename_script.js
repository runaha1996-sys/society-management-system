const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'login.html',
    'dashboard.html',
    'members.html',
    'complaints.html',
    'payments.html',
    'expenses.html',
    'visitors.html',
    'notices.html',
    'settings.html',
    'reports.html'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/js\/script\.js/g, 'js/app.js');
        fs.writeFileSync(file, content);
        console.log(`Updated ${file} to use js/app.js`);
    }
});
