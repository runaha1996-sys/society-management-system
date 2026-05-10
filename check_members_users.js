const db = require('./backend/config/db');

async function checkMembersAndUsers() {
    try {
        const [rows] = await db.query(`
            SELECT m.id, m.name, m.phone, u.username, u.role 
            FROM members m 
            LEFT JOIN users u ON m.id = u.member_id
        `);
        console.log('Members and their linked Users:');
        console.table(rows);
    } catch (err) {
        console.error('Error querying data:', err);
    } finally {
        process.exit();
    }
}

checkMembersAndUsers();
