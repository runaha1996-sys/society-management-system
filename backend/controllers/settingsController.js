const db = require('../config/db');

exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.execute('SELECT * FROM settings WHERE id = 1');
        res.json(settings[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    const { opening_balance, society_name, due_day } = req.body;
    try {
        await db.execute(
            'UPDATE settings SET opening_balance = ?, society_name = ?, due_day = ? WHERE id = 1',
            [opening_balance, society_name, due_day]
        );
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
