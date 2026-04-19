const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, visitorController.getVisitors);
router.post('/', authMiddleware, visitorController.addVisitor);

module.exports = router;
