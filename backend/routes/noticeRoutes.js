const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, noticeController.getNotices);
router.post('/', authMiddleware, noticeController.addNotice);

module.exports = router;
