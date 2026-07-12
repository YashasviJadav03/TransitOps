const express = require('express');
const { getVehicles, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');
const router = express.Router();

router.route('/')
  .get(authMiddleware, authorizeRoles('Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'), getVehicles)
  .post(authMiddleware, authorizeRoles('Fleet Manager'), createVehicle);

router.route('/:id')
  .put(authMiddleware, authorizeRoles('Fleet Manager'), updateVehicle)
  .delete(authMiddleware, authorizeRoles('Fleet Manager'), deleteVehicle);

module.exports = router;
