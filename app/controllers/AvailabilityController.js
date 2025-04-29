const Product = require('../models/ProductModel');
const SafetyEquipment = require('../models/SafetyEquipmentModel');

const checkDateAvailability = async (req, res) => {
    try {
        const dateParam = new Date(req.params.date);
        
        if (isNaN(dateParam.getTime())) {
            return res.status(400).json({ 
                message: 'Invalid date format. Use YYYY-MM-DD' 
            });
        }
        
        const date = new Date(dateParam);
        date.setHours(0, 0, 0, 0);
        
        const availability = {};
        const totalSlots = 48;
        
        const products = await Product.find({ status: 'available' });
        
        for (const product of products) {
            availability[product._id] = {
                type: product.type,
                sizeCategory: product.sizeCategory,
                availableSlots: []
            };
            
            for (let slot = 0; slot < totalSlots; slot++) {
                const booking = product.bookings.find(b => 
                    b.date.toDateString() === date.toDateString() && b.slot === slot
                );
                
                const availableQuantity = booking ? 
                    product.quantity - booking.quantity : 
                    product.quantity;
                
                availability[product._id].availableSlots.push({
                    slot,
                    time: formatSlotTime(slot),
                    availableQuantity
                });
            }
        }
        
        return res.status(200).json({ date: date.toISOString().split('T')[0], availability });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const checkProductAvailability = async (req, res) => {
    try {
        const { date, productId } = req.params;
        const dateParam = new Date(date);
        
        if (isNaN(dateParam.getTime())) {
            return res.status(400).json({ 
                message: 'Invalid date format. Use YYYY-MM-DD' 
            });
        }
        
        const startDate = new Date(dateParam);
        startDate.setHours(0, 0, 0, 0);
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const totalSlots = 48;
        const availability = {
            productId: product._id,
            type: product.type,
            sizeCategory: product.sizeCategory,
            status: product.status,
            slots: []
        };
        
        for (let slot = 0; slot < totalSlots; slot++) {
            const booking = product.bookings.find(b => 
                b.date.toDateString() === startDate.toDateString() && b.slot === slot
            );
            
            const availableQuantity = booking ? 
                product.quantity - booking.quantity : 
                product.quantity;
            
            availability.slots.push({
                slot,
                time: formatSlotTime(slot),
                availableQuantity
            });
        }
        
        if (product.type === 'JetSki' || product.type === 'ATV') {
            const helmets = await SafetyEquipment.find({ type: 'Helmet', status: 'available' });
            availability.requiredEquipment = availability.requiredEquipment || [];
            
            availability.requiredEquipment.push({
                type: 'Helmet',
                availability: await getEquipmentAvailability(helmets, startDate)
            });
            
            if (product.type === 'JetSki') {
                const lifeJackets = await SafetyEquipment.find({ type: 'LifeJacket', status: 'available' });
                availability.requiredEquipment.push({
                    type: 'LifeJacket',
                    availability: await getEquipmentAvailability(lifeJackets, startDate)
                });
            }
        }
        
        return res.status(200).json({ 
            date: startDate.toISOString().split('T')[0], 
            availability 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

async function getEquipmentAvailability(equipmentList, date) {
    const totalSlots = 48;
    const result = [];
    
    let totalQuantity = 0;
    const bookings = [];
    
    for (const equipment of equipmentList) {
        totalQuantity += equipment.quantity;
        for (const booking of equipment.bookings) {
            if (booking.date.toDateString() === date.toDateString()) {
                bookings.push(booking);
            }
        }
    }
    
    for (let slot = 0; slot < totalSlots; slot++) {
        let bookedQuantity = 0;
        
        for (const booking of bookings) {
            if (booking.slot === slot) {
                bookedQuantity += booking.quantity;
            }
        }
        
        result.push({
            slot,
            time: formatSlotTime(slot),
            availableQuantity: totalQuantity - bookedQuantity
        });
    }
    
    return result;
}

function formatSlotTime(slot) {
    const hour = Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

module.exports = {
    checkDateAvailability,
    checkProductAvailability
};
