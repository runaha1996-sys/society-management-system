const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function syncUsers() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '851805',
        database: process.env.DB_NAME || 'society_db'
    });

    // Get all members with phone numbers
    const [members] = await db.execute('SELECT id, phone FROM members WHERE phone IS NOT NULL AND phone != ""');

    console.log(`Found ${members.length} members with phone numbers. Syncing...`);

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('admin@2026', salt);

    for (const member of members) {
        // Check if user already exists
        const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [member.phone]);
        
        if (existing.length === 0) {
            try {
                await db.execute(
                    'INSERT INTO users (username, password, role, member_id) VALUES (?, ?, ?, ?)',
                    [member.phone, defaultPassword, 'member', member.id]
                );
                console.log(`Created login for Member ID ${member.id} (${member.phone})`);
            } catch (err) {
                console.error(`Error creating login for ${member.phone}:`, err.message);
            }
        }
    }

    console.log('Sync complete!');
    process.exit();
}

syncUsers();
