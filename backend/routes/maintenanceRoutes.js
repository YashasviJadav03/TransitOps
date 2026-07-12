const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');const maintenanceController = require('../controllers/maintenanceController');

router.use(authMiddleware);
router.use(authorizeRoles('Fleet Manager'));

router.post('/', maintenanceController.createLog);
router.get('/', maintenanceController.getLogs);
router.patch('/:id/status', maintenanceController.updateStatus);

module.exports = router;
