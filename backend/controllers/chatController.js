const db = require('../config/db');

exports.getMessages = async (req, res) => {
    try {
        const [messages] = await db.execute('SELECT * FROM messages ORDER BY created_at ASC LIMIT 100');
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    const { sender_name, sender_role, message } = req.body;
    try {
        await db.execute(
            'INSERT INTO messages (sender_name, sender_role, message) VALUES (?, ?, ?)',
            [sender_name, sender_role, message]
        );
        res.json({ message: 'Sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
