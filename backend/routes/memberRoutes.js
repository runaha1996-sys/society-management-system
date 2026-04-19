const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, memberController.getMembers);
router.post('/', authMiddleware, memberController.addMember);
router.put('/:id', authMiddleware, memberController.updateMember);
router.patch('/:id/toggle-status', authMiddleware, memberController.toggleMemberStatus);
router.delete('/:id', authMiddleware, memberController.deleteMember);

module.exports = router;
