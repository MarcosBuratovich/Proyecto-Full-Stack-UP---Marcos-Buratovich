const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['JetSki', 'ATV', 'DivingEquipment', 'Surfboard'],
    },
    sizeCategory: {
        type: String,
        enum: ['child', 'adult'],
        required: function() {
            return this.type === 'Surfboard';
        }
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'under maintenance', 'out of stock'],
        default: 'available'
    },
    // To track which items are currently in use for a specific time slot
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

// Define an index for efficient availability lookups
ProductSchema.index({ type: 1, status: 1 });
ProductSchema.index({ 'bookings.date': 1, 'bookings.slot': 1 });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
