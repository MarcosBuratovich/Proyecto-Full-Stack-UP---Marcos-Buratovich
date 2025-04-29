const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff'
    },
    permissions: [{
        type: String,
        enum: [
            'view_products', 
            'manage_products', 
            'view_equipment', 
            'manage_equipment', 
            'view_reservations', 
            'manage_reservations', 
            'process_payments', 
            'manage_users'
        ]
    }]
}, {
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission) || this.role === 'admin';
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
