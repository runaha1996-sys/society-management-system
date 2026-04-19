const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getMembers = async (req, res) => {
    try {
        const [members] = await db.execute('SELECT * FROM members ORDER BY id ASC');
        res.json(members);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addMember = async (req, res) => {
    const { name, bungalow_no, phone, email, password } = req.body;
    const memberPassword = password || 'admin@2026';

    try {
        const [result] = await db.execute(
            'INSERT INTO members (name, bungalow_no, phone, email) VALUES (?, ?, ?, ?)',
            [name, bungalow_no, phone, email]
        );
        
        const memberId = result.insertId;

        // Create a user login for the member ONLY if phone is provided
        if (phone && phone.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(memberPassword, salt);
            await db.execute(
                'INSERT INTO users (username, password, role, member_id) VALUES (?, ?, ?, ?)',
                [phone, hashedPassword, 'member', memberId]
            );
        }

        res.status(201).json({ id: memberId, name, bungalow_no, phone, email, status: 'Active' });
    } catch (err) {
        console.error('Error adding member, payment and user:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateMember = async (req, res) => {
    const { id } = req.params;
    const { name, bungalow_no, phone, email, status, password } = req.body;

    try {
        // Update member details
        await db.execute(
            'UPDATE members SET name = ?, bungalow_no = ?, phone = ?, email = ?, status = ? WHERE id = ?',
            [name, bungalow_no, phone, email, status, id]
        );

        // Update username (phone) in users table
        await db.execute('UPDATE users SET username = ? WHERE member_id = ?', [phone, id]);

        // If a new password is provided, update it in the users table
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.execute('UPDATE users SET password = ? WHERE member_id = ?', [hashedPassword, id]);
        }

        res.json({ message: 'Member updated successfully' });
    } catch (err) {
        console.error('Error updating member and user:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteMember = async (req, res) => {
    const { id } = req.params;

    try {
        // First delete dependent records (payments, complaints) or let ON DELETE CASCADE handle it
        // For safety, let's just delete the member. If FK constraints fail, we'll know.
        // Actually, we should handle dependencies.
        await db.execute('DELETE FROM payments WHERE member_id = ?', [id]);
        await db.execute('DELETE FROM complaints WHERE member_id = ?', [id]);
        await db.execute('DELETE FROM members WHERE id = ?', [id]);
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleMemberStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Active' ? 'Inactive' : 'Active';

    try {
        await db.execute('UPDATE members SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ message: `Member status updated to ${newStatus}`, newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
