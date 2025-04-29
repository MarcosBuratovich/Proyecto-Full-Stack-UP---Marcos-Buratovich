const express = require('express');
const SafetyEquipmentController = require('../controllers/SafetyEquipmentController');
const { protect, restrictTo, hasPermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', SafetyEquipmentController.listAll);

router.post('/', protect, restrictTo('admin'), hasPermission('manage_equipment'), SafetyEquipmentController.create);

router.get('/:id', SafetyEquipmentController.show);

router.put('/:id', protect, restrictTo('admin'), hasPermission('manage_equipment'), SafetyEquipmentController.update);

router.delete('/:id', protect, restrictTo('admin'), hasPermission('manage_equipment'), SafetyEquipmentController.remove);

router.get('/find', SafetyEquipmentController.find);

module.exports = router;
