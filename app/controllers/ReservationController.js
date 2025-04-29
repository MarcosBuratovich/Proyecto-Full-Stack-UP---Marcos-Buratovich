const Reservation = require('../models/ReservationModel');
const Product = require('../models/ProductModel');
const SafetyEquipment = require('../models/SafetyEquipmentModel');

const listAll = async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('products.product')
            .populate('safetyEquipment.equipment');
        
        if (!reservations.length) return res.status(204).send({ message: 'No Content' });
        return res.status(200).json({ reservations });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const show = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('products.product')
            .populate('safetyEquipment.equipment');
        
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        return res.status(200).json({ reservation });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getByDate = async (req, res) => {
    try {
        const dateParam = new Date(req.params.date);
        
        if (isNaN(dateParam.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        const startDate = new Date(dateParam);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(dateParam);
        endDate.setHours(23, 59, 59, 999);
        
        const reservations = await Reservation.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('products.product').populate('safetyEquipment.equipment');
        
        if (!reservations.length) return res.status(204).send({ message: 'No reservations found for this date' });
        return res.status(200).json({ reservations });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { customer, products, date, slots } = req.body;
        
        const reservationDate = new Date(date);
        const now = new Date();
        
        const maxAdvanceTime = new Date();
        maxAdvanceTime.setHours(maxAdvanceTime.getHours() + 48);
        
        if (reservationDate > maxAdvanceTime) {
            return res.status(400).json({ 
                message: 'Reservations cannot be made more than 48 hours in advance' 
            });
        }
        
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ message: 'At least one time slot must be selected' });
        }
        
        if (slots.length > 3) {
            return res.status(400).json({ message: 'Maximum 3 consecutive slots allowed' });
        }
        
        slots.sort((a, b) => a - b);
        for (let i = 1; i < slots.length; i++) {
            if (slots[i] !== slots[i-1] + 1) {
                return res.status(400).json({ message: 'Time slots must be consecutive' });
            }
        }
        
        const safetyEquipment = [];
        let requiresHelmet = false;
        let requiresLifeJacket = false;
        let numberOfRiders = 0;
        
        for (const productItem of products) {
            const product = await Product.findById(productItem.product);
            
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${productItem.product} not found` });
            }
            
            const isAvailable = await checkProductAvailability(product._id, date, slots, productItem.quantity);
            if (!isAvailable) {
                return res.status(400).json({ 
                    message: `${product.type} not available for the selected time slots`
                });
            }
            
            if (product.type === 'JetSki' || product.type === 'ATV') {
                requiresHelmet = true;
                numberOfRiders += Math.min(productItem.quantity * 2, productItem.quantity);
            }
            
            if (product.type === 'JetSki') {
                requiresLifeJacket = true;
            }
        }
        
        if (requiresHelmet) {
            const helmets = await SafetyEquipment.findOne({ type: 'Helmet', status: 'available' });
            if (!helmets || helmets.quantity < numberOfRiders) {
                return res.status(400).json({ message: 'Not enough helmets available' });
            }
            safetyEquipment.push({
                equipment: helmets._id,
                quantity: numberOfRiders
            });
        }
        
        if (requiresLifeJacket) {
            const lifeJackets = await SafetyEquipment.findOne({ type: 'LifeJacket', status: 'available' });
            if (!lifeJackets || lifeJackets.quantity < numberOfRiders) {
                return res.status(400).json({ message: 'Not enough life jackets available' });
            }
            safetyEquipment.push({
                equipment: lifeJackets._id,
                quantity: numberOfRiders
            });
        }
        
        let totalPrice = 0;
        const productTypes = new Set();
        
        for (const productItem of products) {
            const product = await Product.findById(productItem.product);
            productTypes.add(product.type);
            totalPrice += product.price * productItem.quantity * slots.length;
        }
        
        let discount = 0;
        if (productTypes.size > 1) {
            discount = totalPrice * 0.1;
            totalPrice -= discount;
        }
        
        const slotTime = Math.floor(slots[0] / 2); // Convert slot to hour
        const slotMinute = (slots[0] % 2) * 30;   // Get minute (0 or 30)
        
        const paymentDeadline = new Date(date);
        paymentDeadline.setHours(slotTime, slotMinute, 0, 0);
        paymentDeadline.setHours(paymentDeadline.getHours() - 2);
        
        const reservation = new Reservation({
            customer,
            products,
            safetyEquipment,
            date: reservationDate,
            slots,
            totalPrice,
            discount,
            paymentDeadline,
            paymentStatus: 'pending'
        });
        
        await reservation.save();
        
        for (const productItem of products) {
            await updateProductBookings(productItem.product, date, slots, productItem.quantity);
        }
        
        for (const equipmentItem of safetyEquipment) {
            await updateEquipmentBookings(equipmentItem.equipment, date, slots, equipmentItem.quantity);
        }
        
        return res.status(201).json({ 
            message: 'Reservation created successfully', 
            reservation 
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        
        if (req.body.paymentStatus === 'paid' && !req.body.paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required when changing status to paid' });
        }
        
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('products.product').populate('safetyEquipment.equipment');
        
        return res.status(200).json({ 
            message: 'Reservation updated successfully', 
            reservation: updatedReservation 
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        
        const now = new Date();
        const reservationSlotTime = Math.floor(reservation.slots[0] / 2); // Convert slot to hour
        const reservationSlotMinute = (reservation.slots[0] % 2) * 30;    // Get minute (0 or 30)
        
        const slotTime = new Date(reservation.date);
        slotTime.setHours(reservationSlotTime, reservationSlotMinute, 0, 0);
        
        const cancellationDeadline = new Date(slotTime);
        cancellationDeadline.setHours(cancellationDeadline.getHours() - 2);
        
        reservation.cancellationStatus = 'canceled';
        
        if (reservation.paymentStatus === 'paid' && now < cancellationDeadline) {
            reservation.paymentStatus = 'refunded';
        }
        
        await reservation.save();
        
        for (const productItem of reservation.products) {
            await releaseProductBookings(productItem.product, reservation.date, reservation.slots, productItem.quantity);
        }
        
        for (const equipmentItem of reservation.safetyEquipment) {
            await releaseEquipmentBookings(equipmentItem.equipment, reservation.date, reservation.slots, equipmentItem.quantity);
        }
        
        return res.status(200).json({ 
            message: now < cancellationDeadline 
                ? 'Reservation canceled with full refund' 
                : 'Reservation canceled without refund',
            reservation 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const processPayment = async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        if (!paymentMethod || !paymentMethod.type || !paymentMethod.currency) {
            return res.status(400).json({ message: 'Payment method and currency are required' });
        }
        
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        
        reservation.paymentStatus = 'paid';
        reservation.paymentMethod = paymentMethod;
        
        await reservation.save();
        
        return res.status(200).json({ 
            message: 'Payment processed successfully', 
            reservation 
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const processStormRefund = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        
        if (reservation.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Cannot process refund for unpaid reservation' });
        }
        
        reservation.cancellationStatus = 'storm-refund';
        reservation.paymentStatus = 'partial-refund';
        reservation.weatherCondition = 'storm';
        
        const refundAmount = reservation.totalPrice * 0.5;
        
        await reservation.save();
        
        for (const productItem of reservation.products) {
            await releaseProductBookings(productItem.product, reservation.date, reservation.slots, productItem.quantity);
        }
        for (const productItem of reservation.products) {
            await releaseProductBookings(productItem.product, reservation.date, reservation.slots, productItem.quantity);
        }
        
        for (const equipmentItem of reservation.safetyEquipment) {
            await releaseEquipmentBookings(equipmentItem.equipment, reservation.date, reservation.slots, equipmentItem.quantity);
        }
        
        return res.status(200).json({ 
            message: 'Storm refund processed successfully', 
            refundAmount,
            reservation 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

async function checkProductAvailability(productId, date, slots, quantity) {
    const product = await Product.findById(productId);
    if (!product) return false;
    
    if (product.quantity < quantity) return false;
    
    for (const slot of slots) {
        const bookingIndex = product.bookings.findIndex(b => 
            b.date.toDateString() === new Date(date).toDateString() && b.slot === slot
        );
        
        if (bookingIndex !== -1) {
            const bookedQuantity = product.bookings[bookingIndex].quantity;
            if (product.quantity - bookedQuantity < quantity) {
                return false;
            }
        }
    }
    
    return true;
}

async function updateProductBookings(productId, date, slots, quantity) {
    const product = await Product.findById(productId);
    
    for (const slot of slots) {
        const bookingIndex = product.bookings.findIndex(b => 
            b.date.toDateString() === new Date(date).toDateString() && b.slot === slot
        );
        
        if (bookingIndex !== -1) {
            product.bookings[bookingIndex].quantity += quantity;
        } else {
            product.bookings.push({
                date: new Date(date),
                slot,
                quantity
            });
        }
    }
    
    await product.save();
}

async function updateEquipmentBookings(equipmentId, date, slots, quantity) {
    const equipment = await SafetyEquipment.findById(equipmentId);
    
    for (const slot of slots) {
        const bookingIndex = equipment.bookings.findIndex(b => 
            b.date.toDateString() === new Date(date).toDateString() && b.slot === slot
        );
        
        if (bookingIndex !== -1) {
            equipment.bookings[bookingIndex].quantity += quantity;
        } else {
            equipment.bookings.push({
                date: new Date(date),
                slot,
                quantity
            });
        }
    }
    
    await equipment.save();
}

async function releaseProductBookings(productId, date, slots, quantity) {
    const product = await Product.findById(productId);
    
    for (const slot of slots) {
        const bookingIndex = product.bookings.findIndex(b => 
            b.date.toDateString() === new Date(date).toDateString() && b.slot === slot
        );
        
        if (bookingIndex !== -1) {
            product.bookings[bookingIndex].quantity -= quantity;
            
            if (product.bookings[bookingIndex].quantity <= 0) {
                product.bookings.splice(bookingIndex, 1);
            }
        }
    }
    
    await product.save();
}

async function releaseEquipmentBookings(equipmentId, date, slots, quantity) {
    const equipment = await SafetyEquipment.findById(equipmentId);
    
    for (const slot of slots) {
        const bookingIndex = equipment.bookings.findIndex(b => 
            b.date.toDateString() === new Date(date).toDateString() && b.slot === slot
        );
        
        if (bookingIndex !== -1) {
            equipment.bookings[bookingIndex].quantity -= quantity;
            
            if (equipment.bookings[bookingIndex].quantity <= 0) {
                equipment.bookings.splice(bookingIndex, 1);
            }
        }
    }
    
    await equipment.save();
}

module.exports = {
    listAll,
    show,
    getByDate,
    create,
    update,
    cancelReservation,
    processPayment,
    processStormRefund
};
