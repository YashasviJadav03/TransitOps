const express = require('express');
const { addFuelLog, addExpense, getVehicleCosts } = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/fuel', addFuelLog);
router.post('/expense', addExpense);
router.get('/costs', getVehicleCosts);

module.exports = router;
