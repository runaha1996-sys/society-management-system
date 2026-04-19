const db = require('../config/db');

exports.getComplaints = async (req, res) => {
    const { role, member_id } = req.user;
    
    try {
        let query = `
            SELECT c.*, m.name as member_name 
            FROM complaints c 
            LEFT JOIN members m ON c.member_id = m.id
        `;
        let params = [];

        if (role === 'member') {
            if (!member_id) {
                console.warn('[API] Member ID missing for member role. Returning empty list.');
                return res.json([]);
            }
            query += ' WHERE c.member_id = ?';
            params.push(member_id);
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await db.execute(query, params);
        res.json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addComplaint = async (req, res) => {
    let { member_id, title, description } = req.body;
    const userRole = req.user.role;
    const userId = req.user.member_id;

    // If user is a member, force their own member_id
    if (userRole === 'member') {
        member_id = userId;
    }

    try {
        if (!member_id) {
            return res.status(400).json({ message: 'Member ID is required' });
        }

        const [result] = await db.execute(
            'INSERT INTO complaints (member_id, title, description, status) VALUES (?, ?, ?, ?)',
            [member_id, title, description, 'Open']
        );
        res.status(201).json({ id: result.insertId, title, description, status: 'Open', date: new Date() });
    } catch (err) {
        console.error('Database error while saving complaint:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
