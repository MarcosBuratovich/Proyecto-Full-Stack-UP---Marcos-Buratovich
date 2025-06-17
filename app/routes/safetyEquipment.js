const express = require('express');
const SafetyEquipmentController = require('../controllers/SafetyEquipmentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', SafetyEquipmentController.listAll);

router.post('/', protect, restrictTo('admin'), SafetyEquipmentController.create);

router.get('/:id', SafetyEquipmentController.show);

router.put('/:id', protect, restrictTo('admin'), SafetyEquipmentController.update);

router.delete('/:id', protect, restrictTo('admin'), SafetyEquipmentController.remove);

router.get('/find', SafetyEquipmentController.find);

module.exports = router;
