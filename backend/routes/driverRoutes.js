const express = require('express');
const { getDrivers, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(authMiddleware, getDrivers)
  .post(authMiddleware, createDriver);

router.route('/:id')
  .put(authMiddleware, updateDriver)
  .delete(authMiddleware, deleteDriver);

module.exports = router;
