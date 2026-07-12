const express = require('express');
const { getDashboardStats, getChartData, getFleetReports } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('Fleet Manager', 'Financial Analyst'));
router.get('/stats', getDashboardStats);
router.get('/chart', getChartData);
router.get('/reports', getFleetReports);

module.exports = router;
