const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[REQ] ${req.method} ${req.url}`);
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[RES] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// API Routes
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

// Root route
app.get('/', (req, res) => {
    res.send('Society Management API is running...');
});

// Catch-all route for 404
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
