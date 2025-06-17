const mongoose = require('mongoose');

const SafetyEquipmentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Helmet', 'LifeJacket'],
    },
    size: {
        type: String,
        required: true,
        enum: ['XS', 'S', 'M', 'L', 'XL']
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'under maintenance', 'out of stock'],
        default: 'available'
    },
    // To track which safety equipment is currently in use for a specific time slot
    bookings: [{
        date: {
            type: Date,
            required: true
        },
        slot: {
            type: Number, // Slot number (0-47 for 48 slots of 30 minutes in a day)
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
}, {
    timestamps: true
});

SafetyEquipmentSchema.index({ type: 1, status: 1 });
SafetyEquipmentSchema.index({ 'bookings.date': 1, 'bookings.slot': 1 });

const SafetyEquipment = mongoose.model('SafetyEquipment', SafetyEquipmentSchema);

module.exports = SafetyEquipment;
