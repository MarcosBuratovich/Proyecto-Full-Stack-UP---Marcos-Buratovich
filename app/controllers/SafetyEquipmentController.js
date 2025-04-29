const SafetyEquipment = require('../models/SafetyEquipmentModel');

const listAll = async (req, res) => {
    try {
        const equipment = await SafetyEquipment.find({});
        if (!equipment.length) return res.status(204).send({ message: 'No Content' });
        return res.status(200).json({ equipment });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const equipment = new SafetyEquipment(req.body);
        await equipment.save();
        return res.status(201).json({ equipment });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const show = async (req, res) => {
    try {
        const equipment = await SafetyEquipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Safety equipment not found' });
        return res.status(200).json({ equipment });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const equipment = await SafetyEquipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!equipment) return res.status(404).json({ message: 'Safety equipment not found' });
        return res.status(200).json({ message: 'Safety equipment updated', equipment });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const equipment = await SafetyEquipment.findByIdAndDelete(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Safety equipment not found' });
        return res.status(200).json({ message: 'Safety equipment removed', equipment });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const find = async (req, res) => {
    try {
        const { type, size, status } = req.query;
        const filter = {};
        
        if (type) filter.type = type;
        if (size) filter.size = size;
        if (status) filter.status = status;
        
        const equipment = await SafetyEquipment.find(filter);
        if (!equipment.length) return res.status(204).send({ message: 'No safety equipment found matching criteria' });
        return res.status(200).json({ equipment });
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
