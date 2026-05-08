const fs = require('fs');
const db = require('./config/db');

async function setupDB() {
  try {
    const schemaSql = fs.readFileSync('./schema.sql', 'utf8');
    
    // Create database first
    await db.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQLDATABASE || 'railway'}\``);
    await db.query(`USE \`${process.env.MYSQLDATABASE || 'railway'}\``);
    
    // Execute schema
    await db.query(schemaSql);
    
    console.log('✅ Database schema executed successfully!');
  } catch (err) {
    console.error('❌ DB setup failed:', err.message);
  } finally {
    process.exit(0);
  }
}

setupDB();

