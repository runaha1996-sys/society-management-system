const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// ✅ Correct path to .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function resetAdmin() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '851805',
            database: process.env.DB_NAME || 'society_db'
        });

        const salt = await bcrypt.genSalt(10);
        // ✅ Set to admin123 as requested by user
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await db.execute('DELETE FROM users WHERE username = "admin"');
        await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);

        console.log('✅ Admin user reset to: admin / admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting admin:', err.message);
        process.exit(1);
    }
}

resetAdmin();
