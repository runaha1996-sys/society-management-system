const db = require('../config/db');

exports.getNotices = async (req, res) => {
    try {
        const [notices] = await db.execute('SELECT * FROM notices ORDER BY created_at DESC');
        res.json(notices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addNotice = async (req, res) => {
    const { title, content, date } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO notices (title, content, date) VALUES (?, ?, ?)',
            [title, content, date || new Date()]
        );
        res.status(201).json({ id: result.insertId, title, content, date, created_at: new Date() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
