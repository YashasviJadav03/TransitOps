const express = require('express');
const { createTrip, getTrips, updateTripStatus } = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('Fleet Manager', 'Dispatcher'));
router.post('/', createTrip);
router.get('/', getTrips);
router.patch('/:id/status', updateTripStatus);

module.exports = router;
