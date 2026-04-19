const db = require('../config/db');

exports.getExpenses = async (req, res) => {
    try {
        const [expenses] = await db.execute('SELECT * FROM expenses ORDER BY expense_date DESC');
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addExpense = async (req, res) => {
    const { title, amount, expense_date, month, category } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO expenses (title, amount, expense_date, month, category) VALUES (?, ?, ?, ?, ?)',
            [title, amount, expense_date, month, category]
        );
        res.status(201).json({ id: result.insertId, title, amount, expense_date });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM expenses WHERE id = ?', [id]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
