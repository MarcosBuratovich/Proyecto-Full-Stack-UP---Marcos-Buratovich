const express = require('express');
const ReservationController = require('../controllers/ReservationController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, restrictTo('staff','admin'), ReservationController.listAll);

router.get('/:id', protect, restrictTo('staff','admin'), ReservationController.show);

router.get('/date/:date', protect, restrictTo('staff','admin'), ReservationController.getByDate);

router.post('/', protect, restrictTo('staff','admin'), ReservationController.create);

router.put('/:id', protect, restrictTo('admin'), ReservationController.update);

router.put('/:id/cancel', protect, restrictTo('staff','admin'), ReservationController.cancelReservation);

router.put('/:id/payment', protect, restrictTo('staff','admin'), ReservationController.processPayment);

router.put('/:id/storm-refund', protect, restrictTo('staff','admin'), ReservationController.processStormRefund);

module.exports = router;
