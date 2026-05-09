const mysql = require('mysql2');
require('dotenv').config();

// Railway provides DATABASE_URL or individual MYSQL* variables.
// Local development uses variables from .env (DB_HOST, DB_USER, etc.)
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
let pool;

if (dbUrl) {
  // Parsing DATABASE_URL (format: mysql://user:password@host:port/database)
  try {
    const url = new URL(dbUrl);
    pool = mysql.createPool({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remove leading /
      port: parseInt(url.port, 10) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
      // Some cloud providers require SSL
      ssl: {
        rejectUnauthorized: false
      }
    });
  } catch (err) {
    console.error('Invalid DATABASE_URL:', err.message);
  }
} 

// Fallback if no dbUrl or if parsing failed
if (!pool) {
  pool = mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '851805',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'society_db',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || 3306, 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });
}

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully');
        connection.release();
    }
});

module.exports = pool.promise();