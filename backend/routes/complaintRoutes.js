const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, complaintController.getComplaints);
router.post('/', authMiddleware, complaintController.addComplaint);
router.patch('/:id/status', authMiddleware, complaintController.updateComplaintStatus);

console.log('✅ Complaint routes loaded');

module.exports = router;
