const db = require('../config/db');

exports.getPayments = async (req, res) => {
    try {
        const role = req.user?.role;
        const member_id = req.user?.member_id;

        console.log(`[API] Fetching payments for role: ${role}, member_id: ${member_id}`);

        let query = `
            SELECT p.*, m.name as member_name, m.bungalow_no 
            FROM payments p 
            JOIN members m ON p.member_id = m.id
        `;
        let params = [];

        if (role === 'member') {
            if (!member_id) {
                console.warn('[API] Member ID missing for member role. Returning empty list.');
                return res.json([]);
            }
            query += ' WHERE p.member_id = ?';
            params.push(member_id);
        }

        query += ' ORDER BY p.created_at DESC';

        const [payments] = await db.execute(query, params);
        res.json(payments);
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addPayment = async (req, res) => {
    const { member_id, amount, status, type, payment_date, month, payment_method } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO payments (member_id, amount, status, type, payment_date, month, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [member_id, amount, status, type, payment_date || new Date(), month, payment_method]
        );
        res.status(201).json({ id: result.insertId, member_id, amount, status, type, month, payment_method });
    } catch (err) {
        console.error('Error adding payment:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
