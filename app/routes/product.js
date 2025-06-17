const express = require('express');
const ProductController = require('../controllers/ProductController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();


router.get('/', ProductController.listAll);

router.post('/', protect, restrictTo('admin'), ProductController.create);

router.get('/:id', ProductController.show);

router.put('/:id', protect, restrictTo('admin'), ProductController.update);

router.delete('/:id', protect, restrictTo('admin'), ProductController.remove);

router.get('/find', ProductController.find);

module.exports = router;
