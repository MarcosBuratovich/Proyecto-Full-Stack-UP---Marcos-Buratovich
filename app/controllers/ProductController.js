const Product = require('../models/ProductModel');

// Get all products
const listAll = async (req, res) => {
    try {
        const products = await Product.find({});
        if (!products.length) return res.status(204).send({ message: 'No Content' });
        return res.status(200).json({ products });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Create a new product
const create = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        return res.status(201).json({ product });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Get product by ID
const show = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json({ product });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update product
const update = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json({ message: 'Product updated', product });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Delete product
const remove = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json({ message: 'Product removed', product });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Filter products
const find = async (req, res) => {
    try {
        const { type, status } = req.query;
        const filter = {};
        
        if (type) filter.type = type;
        if (status) filter.status = status;
        
        const products = await Product.find(filter);
        if (!products.length) return res.status(204).send({ message: 'No products found matching criteria' });
        return res.status(200).json({ products });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    listAll,
    create,
    show,
    update,
    remove,
    find
};
