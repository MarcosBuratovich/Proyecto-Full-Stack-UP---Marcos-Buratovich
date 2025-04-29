const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    customer: {
        name: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        }
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    safetyEquipment: [{
        equipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SafetyEquipment',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    date: {
        type: Date,
        required: true
    },
    slots: [{
        type: Number, // Slot numbers (0-47)
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'refunded', 'partial-refund'],
        default: 'pending'
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['cash', 'card'],
            required: function() { return this.paymentStatus !== 'pending'; }
        },
        currency: {
            type: String,
            enum: ['local', 'foreign'],
            required: function() { return this.paymentStatus !== 'pending'; }
        }
    },
    cancellationStatus: {
        type: String,
        enum: ['none', 'canceled', 'storm-refund'],
        default: 'none'
    },
    weatherCondition: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'storm'],
        default: 'sunny'
    },
    discount: {
        type: Number,
        default: 0
    },
    paymentDeadline: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Define indexes for efficient querying
ReservationSchema.index({ date: 1 });
ReservationSchema.index({ 'customer.name': 1 });
ReservationSchema.index({ paymentStatus: 1 });
ReservationSchema.index({ cancellationStatus: 1 });

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;
