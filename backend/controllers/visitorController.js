const db = require('../config/db');

exports.getVisitors = async (req, res) => {
    try {
        const [visitors] = await db.execute('SELECT * FROM visitors ORDER BY entry_time DESC');
        res.json(visitors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addVisitor = async (req, res) => {
    const { name, purpose, visiting_bungalow, phone } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO visitors (name, purpose, visiting_bungalow, phone) VALUES (?, ?, ?, ?)',
            [name, purpose, visiting_bungalow, phone]
        );
        res.status(201).json({ id: result.insertId, name, purpose, visiting_bungalow, phone, status: 'In' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
