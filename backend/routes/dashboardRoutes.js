const express = require('express');
const { getDashboardStats, getChartData } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/chart', getChartData);

module.exports = router;
