const express = require('express');
const { getDrivers, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');
const router = express.Router();

router.route('/')
  .get(authMiddleware, authorizeRoles('Fleet Manager', 'Dispatcher', 'Safety Officer'), getDrivers)
  .post(authMiddleware, authorizeRoles('Fleet Manager', 'Safety Officer'), createDriver);

router.route('/:id')
  .put(authMiddleware, authorizeRoles('Fleet Manager', 'Safety Officer'), updateDriver)
  .delete(authMiddleware, authorizeRoles('Fleet Manager', 'Safety Officer'), deleteDriver);

module.exports = router;
