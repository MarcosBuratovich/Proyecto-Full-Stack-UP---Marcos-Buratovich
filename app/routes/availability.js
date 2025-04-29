const express = require('express');
const AvailabilityController = require('../controllers/AvailabilityController');

const router = express.Router();

router.get('/:date', AvailabilityController.checkDateAvailability);

router.get('/:date/:productId', AvailabilityController.checkProductAvailability);

module.exports = router;
