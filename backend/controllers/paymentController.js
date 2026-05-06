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
        let pDate = payment_date;
        if (!pDate) {
            const d = new Date();
            pDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        // If trying to add a payment, check if there's already a pending invoice for this member, month and type
        const [existing] = await db.execute(
            'SELECT id FROM payments WHERE member_id = ? AND month = ? AND type = ? AND status IN ("Pending", "Overdue")',
            [member_id, month, type]
        );

        if (existing.length > 0) {
            // Update the existing pending invoice instead of duplicating
            await db.execute(
                'UPDATE payments SET amount = ?, status = ?, payment_date = ?, payment_method = ? WHERE id = ?',
                [amount, status, pDate, payment_method, existing[0].id]
            );
            return res.status(200).json({ message: 'Pending invoice updated to paid successfully', id: existing[0].id });
        }

        // Otherwise insert a new record
        const [result] = await db.execute(
            'INSERT INTO payments (member_id, amount, status, type, payment_date, month, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [member_id, amount, status, type, pDate, month, payment_method]
        );
        res.status(201).json({ id: result.insertId, member_id, amount, status, type, month, payment_method });
    } catch (err) {
        console.error('Error adding payment:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.generateDues = async (req, res) => {
    const { amount, month, year } = req.body;

    try {
        // Fetch all active members
        const [members] = await db.execute('SELECT id FROM members WHERE status = "Active"');
        
        if (members.length === 0) {
            return res.status(400).json({ message: 'No active members found.' });
        }

        const d = new Date();
        const paymentDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        let count = 0;

        for (let member of members) {
            // Check if dues already generated for this member for this month
            const [existing] = await db.execute(
                'SELECT id FROM payments WHERE member_id = ? AND month = ? AND type = "Maintenance"',
                [member.id, month]
            );

            if (existing.length === 0) {
                await db.execute(
                    'INSERT INTO payments (member_id, amount, status, type, payment_date, month, payment_method) VALUES (?, ?, "Pending", "Maintenance", ?, ?, "Cash")',
                    [member.id, amount || 400, paymentDate, month]
                );
                count++;
            }
        }

        res.json({ message: `Generated dues for ${count} members successfully.` });
    } catch (err) {
        console.error('Error generating dues:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsPaid = async (req, res) => {
    const { id } = req.params;
    const { payment_method } = req.body;

    try {
        const d = new Date();
        const paymentDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        const [result] = await db.execute(
            'UPDATE payments SET status = "Paid", payment_date = ?, payment_method = ? WHERE id = ?',
            [paymentDate, payment_method || 'Cash', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json({ message: 'Payment marked as paid' });
    } catch (err) {
        console.error('Error marking payment as paid:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
