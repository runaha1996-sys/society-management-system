const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, paymentController.getPayments);
router.post('/', authMiddleware, paymentController.addPayment);
router.post('/generate-dues', authMiddleware, paymentController.generateDues);
router.put('/:id/mark-paid', authMiddleware, paymentController.markAsPaid);

module.exports = router;
