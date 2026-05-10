const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// ✅ Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// ✅ Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Auto-Initialize Database & Admin User
async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database...');
        
        await db.query(`CREATE TABLE IF NOT EXISTS members (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), bungalow_no VARCHAR(20), phone VARCHAR(20), email VARCHAR(100), status VARCHAR(20) DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE, password VARCHAR(255), role VARCHAR(20), member_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        
        // Ensure member_id column exists (Migration for production)
        try {
            await db.query(`ALTER TABLE users ADD COLUMN member_id INT`);
            await db.query(`ALTER TABLE users ADD CONSTRAINT fk_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE`);
            console.log('✅ Added member_id column and foreign key to users table.');
        } catch (e) {
            // Column probably already exists
        }

        await db.query(`CREATE TABLE IF NOT EXISTS expenses (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), amount DECIMAL(10, 2), expense_date DATE, month VARCHAR(20), category VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS settings (id INT PRIMARY KEY, opening_balance DECIMAL(15, 2) DEFAULT 0, society_name VARCHAR(100) DEFAULT 'Aananda Society', due_day INT DEFAULT 10)`);
        await db.query(`CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, sender_name VARCHAR(100), sender_role VARCHAR(20), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS notices (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), content TEXT, date DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS visitors (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), phone VARCHAR(20), purpose VARCHAR(255), visiting_bungalow VARCHAR(20), entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status VARCHAR(10) DEFAULT 'In')`);
        await db.query(`CREATE TABLE IF NOT EXISTS complaints (id INT AUTO_INCREMENT PRIMARY KEY, member_id INT, title VARCHAR(255), description TEXT, status VARCHAR(20) DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        
        // Migration: Ensure complaints status column is wide enough and not restricted
        try {
            await db.query(`ALTER TABLE complaints MODIFY COLUMN status VARCHAR(50) DEFAULT 'Open'`);
            console.log('✅ Updated complaints status column.');
        } catch (e) {
            console.warn('⚠️ Could not update complaints status column:', e.message);
        }

        await db.query(`CREATE TABLE IF NOT EXISTS payments (id INT AUTO_INCREMENT PRIMARY KEY, member_id INT, amount DECIMAL(10, 2), payment_date DATE, status VARCHAR(20) DEFAULT 'Pending', type VARCHAR(50), month VARCHAR(20), payment_method VARCHAR(20) DEFAULT 'Cash', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        await db.query('INSERT IGNORE INTO settings (id, opening_balance, society_name, due_day) VALUES (1, 0, "Aananda Society", 10)');

        // Ensure Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const [rows] = await db.query('SELECT * FROM users WHERE username = "admin"');
        if (rows.length === 0) {
            await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
            console.log('✅ Default admin user created (admin/admin123)');
        } else {
            // Password update removed to prevent overwriting user-set passwords on restart
            console.log('ℹ️ Admin user already exists.');
        }
        
        // Ensure Sample Members if table is empty
        const [mRows] = await db.query('SELECT COUNT(*) as count FROM members');
        if (mRows[0].count === 0) {
            await db.query("INSERT INTO members (name, bungalow_no, phone, email, status) VALUES ('Rajesh Sharma', 'A-101', '+91 98765 00001', 'rajesh@email.com', 'Active')");
            await db.query("INSERT INTO members (name, bungalow_no, phone, email, status) VALUES ('Priya Patel', 'A-102', '+91 98765 00002', 'priya@email.com', 'Active')");
            console.log('✅ Sample members added to production database.');
        }

        console.log('✅ Database initialization complete.');
    } catch (err) {
        console.error('❌ Database initialization failed:', err.message);
    }
}
initializeDatabase();

// ✅ API Routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/members', memberRoutes);
apiRouter.use('/visitors', visitorRoutes);
apiRouter.use('/complaints', complaintRoutes);
apiRouter.use('/notices', noticeRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/chat', chatRoutes);

app.use('/api', apiRouter);

app.get('/', (req, res) => {
    res.send('Society Management API is running...');
});

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});