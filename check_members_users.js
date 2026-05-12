const db = require('./backend/config/db');

async function checkData() {
    try {
        const [users] = await db.query('SELECT id, username, role, member_id FROM users');
        console.log('--- Users ---');
        console.table(users);

        const [members] = await db.query('SELECT id, name, phone FROM members');
        console.log('--- Members ---');
        console.table(members);

        // Check for duplicate usernames
        const [duplicates] = await db.query('SELECT username, COUNT(*) as count FROM users GROUP BY username HAVING count > 1');
        if (duplicates.length > 0) {
            console.log('!!! DUPLICATE USERNAMES FOUND !!!');
            console.table(duplicates);
        } else {
            console.log('No duplicate usernames found.');
        }

        // Check for orphaned users (role member but no member_id or member doesn't exist)
        const [orphans] = await db.query('SELECT u.id, u.username FROM users u LEFT JOIN members m ON u.member_id = m.id WHERE u.role = "member" AND m.id IS NULL');
        if (orphans.length > 0) {
            console.log('!!! ORPHANED USERS FOUND !!!');
            console.table(orphans);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkData();
