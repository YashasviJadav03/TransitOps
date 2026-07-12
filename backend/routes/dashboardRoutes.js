const express = require('express');
const { getDashboardStats, getChartData } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('Fleet Manager', 'Financial Analyst'));
router.get('/stats', getDashboardStats);
router.get('/chart', getChartData);

module.exports = router;
