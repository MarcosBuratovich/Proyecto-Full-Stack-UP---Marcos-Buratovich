const express = require('express');
const ReservationController = require('../controllers/ReservationController');
const { protect, restrictTo, hasPermission } = require('../middleware/auth');

const router = express.Router();


router.get('/', protect, hasPermission('view_reservations'), ReservationController.listAll);

router.get('/:id', protect, hasPermission('view_reservations'), ReservationController.show);

router.get('/date/:date', protect, hasPermission('view_reservations'), ReservationController.getByDate);

router.post('/', ReservationController.create);

router.put('/:id', protect, hasPermission('manage_reservations'), ReservationController.update);

router.put('/:id/cancel', ReservationController.cancelReservation);

router.put('/:id/payment', protect, hasPermission('process_payments'), ReservationController.processPayment);

router.put('/:id/storm-refund', protect, hasPermission('process_payments'), ReservationController.processStormRefund);

module.exports = router;
