const express = require('express');
const ProductController = require('../controllers/ProductController');
const { protect, restrictTo, hasPermission } = require('../middleware/auth');

const router = express.Router();


router.get('/', ProductController.listAll);

router.post('/', protect, restrictTo('admin'), hasPermission('manage_products'), ProductController.create);

router.get('/:id', ProductController.show);

router.put('/:id', protect, restrictTo('admin'), hasPermission('manage_products'), ProductController.update);

router.delete('/:id', protect, restrictTo('admin'), hasPermission('manage_products'), ProductController.remove);

router.get('/find', ProductController.find);

module.exports = router;
