const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function resetAdmin() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '851805',
        database: process.env.DB_NAME || 'society_db'
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin#2026', salt);

    await db.execute('DELETE FROM users WHERE username = "admin"');
    await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);

    console.log('Admin password reset successfully');
    process.exit();
}

resetAdmin();
