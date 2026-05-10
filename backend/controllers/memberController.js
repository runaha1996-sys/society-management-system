const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getMembers = async (req, res) => {
    try {
        const [members] = await db.query('SELECT * FROM members ORDER BY id ASC');
        res.json(members);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addMember = async (req, res) => {
    const { name, bungalow_no, phone, email, password } = req.body;
    const memberPassword = password || 'admin@2026';
    const trimmedPhone = phone ? phone.trim() : '';
    // Clean phone for username (remove non-digits for consistent login)
    const cleanPhone = trimmedPhone.replace(/\D/g, '').slice(-10);

    try {
        const [result] = await db.query(
            'INSERT INTO members (name, bungalow_no, phone, email) VALUES (?, ?, ?, ?)',
            [name, bungalow_no, trimmedPhone, email]
        );
        
        const memberId = result.insertId;

        // Create a user login for the member ONLY if phone is provided
        if (cleanPhone && cleanPhone !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(memberPassword, salt);
            try {
                await db.query(
                    'INSERT INTO users (username, password, role, member_id) VALUES (?, ?, ?, ?)',
                    [cleanPhone, hashedPassword, 'member', memberId]
                );
            } catch (uErr) {
                console.error('Error creating user login (phone might already exist):', uErr.message);
            }
        }

        res.status(201).json({ id: memberId, name, bungalow_no, phone: trimmedPhone, email, status: 'Active' });
    } catch (err) {
        console.error('Error adding member:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

exports.updateMember = async (req, res) => {
    const { id } = req.params;
    const { name, bungalow_no, phone, email, status, password } = req.body;
    const trimmedPhone = phone ? phone.trim() : '';
    // Clean phone for username
    const cleanPhone = trimmedPhone.replace(/\D/g, '').slice(-10);

    try {
        // Update member details
        await db.query(
            'UPDATE members SET name = ?, bungalow_no = ?, phone = ?, email = ?, status = ? WHERE id = ?',
            [name, bungalow_no, trimmedPhone, email, status || 'Active', id]
        );

        // Update or create user login for the member
        const [existingUsers] = await db.query('SELECT * FROM users WHERE member_id = ?', [id]);
        
        if (existingUsers.length > 0) {
            const user = existingUsers[0];
            // Only update username if cleanPhone is provided and different
            if (cleanPhone !== '' && cleanPhone !== user.username) {
                try {
                    await db.query('UPDATE users SET username = ? WHERE member_id = ?', [cleanPhone, id]);
                } catch (uErr) {
                    console.error('Error updating username (likely duplicate):', uErr.message);
                }
            }
        } else if (cleanPhone !== '') {
            // Create new user if phone is now provided
            const salt = await bcrypt.genSalt(10);
            const defaultHashedPassword = await bcrypt.hash('admin@2026', salt);
            try {
                await db.query(
                    'INSERT INTO users (username, password, role, member_id) VALUES (?, ?, ?, ?)',
                    [cleanPhone, defaultHashedPassword, 'member', id]
                );
            } catch (iErr) {
                console.error('Error creating user for member:', iErr.message);
            }
        }

        // If a new password is provided, update it in the users table
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.query('UPDATE users SET password = ? WHERE member_id = ?', [hashedPassword, id]);
        }

        res.json({ message: 'Member updated successfully' });
    } catch (err) {
        console.error('Error updating member:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

exports.deleteMember = async (req, res) => {
    const { id } = req.params;

    try {
        // First delete dependent records (payments, complaints) or let ON DELETE CASCADE handle it
        // For safety, let's just delete the member. If FK constraints fail, we'll know.
        // Actually, we should handle dependencies.
        await db.query('DELETE FROM payments WHERE member_id = ?', [id]);
        await db.query('DELETE FROM complaints WHERE member_id = ?', [id]);
        await db.query('DELETE FROM members WHERE id = ?', [id]);
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
        await db.query('UPDATE members SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ message: `Member status updated to ${newStatus}`, newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
