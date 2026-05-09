const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

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

// ✅ Auto-Reset Admin on Startup (Ensures production admin is always admin / admin123)
async function ensureAdminUser() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        // Check if admin exists
        const [rows] = await db.query('SELECT * FROM users WHERE username = "admin"');
        
        if (rows.length === 0) {
            await db.query('INSERT INTO users (username, password, role, member_id) VALUES (?, ?, ?, ?)', ['admin', hashedPassword, 'admin', null]);
            console.log('✅ Default admin user created (admin / admin123)');
        } else {
            // Update password to match admin123
            await db.query('UPDATE users SET password = ? WHERE username = "admin"', [hashedPassword]);
            console.log('✅ Admin password verified and synced');
        }
    } catch (err) {
        console.error('⚠️ Could not ensure admin user:', err.message);
    }
}
ensureAdminUser();

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

const PORT = process.env.PORT || 5001; // Match the configured port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});