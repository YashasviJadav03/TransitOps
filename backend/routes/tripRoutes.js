const express = require('express');
const { createTrip, getTrips, updateTripStatus } = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTrip);
router.get('/', getTrips);
router.patch('/:id/status', updateTripStatus);

module.exports = router;
