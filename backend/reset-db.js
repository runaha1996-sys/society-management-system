const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function resetDatabase() {
    const dbConfig = {
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '851805',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'society_db',
        port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || 3306, 10),
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : null
    };

    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log('⚠️ Starting database reset...');
        
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = ['payments', 'complaints', 'users', 'members', 'messages', 'visitors', 'notices', 'expenses'];
        
        for (const table of tables) {
            if (table === 'users') {
                // Keep the admin user
                await connection.execute('DELETE FROM users WHERE role != "admin"');
                console.log('✅ Cleared users (except admin)');
            } else {
                await connection.execute(`DELETE FROM ${table}`);
                await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
                console.log(`✅ Cleared table: ${table}`);
            }
        }
        
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✨ Database reset successfully! You can now start fresh.');
        
    } catch (err) {
        console.error('❌ Reset failed:', err.message);
    } finally {
        await connection.end();
        process.exit();
    }
}

resetDatabase();
