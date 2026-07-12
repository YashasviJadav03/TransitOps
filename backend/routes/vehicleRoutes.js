const express = require('express');
const { getVehicles, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(authMiddleware, getVehicles)
  .post(authMiddleware, createVehicle);

router.route('/:id')
  .put(authMiddleware, updateVehicle)
  .delete(authMiddleware, deleteVehicle);

module.exports = router;
