const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const maintenanceController = require('../controllers/maintenanceController');

router.use(authMiddleware);

router.post('/', maintenanceController.createLog);
router.get('/', maintenanceController.getLogs);
router.patch('/:id/status', maintenanceController.updateStatus);

module.exports = router;
