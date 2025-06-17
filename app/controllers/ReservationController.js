const Reservation = require('../models/ReservationModel');
const Product = require('../models/ProductModel');
const SafetyEquipment = require('../models/SafetyEquipmentModel');

const listAll = async (req, res) => {
  try {
    let reservations;
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      // Admins y staff pueden ver todas las reservas
      reservations = await Reservation.find({})
        .populate('products.product')
        .populate('safetyEquipment.equipment');
    } else {
      // Usuarios regulares solo pueden ver sus propias reservas
      reservations = await Reservation.find({ 'customer.id': req.user.id })
        .populate('products.product')
        .populate('safetyEquipment.equipment');
    }

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
        const { customer, products, date, slots, riders, safetyEquipmentRequested } = req.body;

        if (!customer || !customer.name || !customer.contact) {
            return res.status(400).json({ message: 'Customer name and contact are required' });
        }

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
        // Max riders capacity (2 per JetSki/ATV)
        let capacity = 0;
        // Contador de unidades totales para aplicar descuento cuando >1
        const totalUnits = products.reduce((sum, item) => sum + item.quantity, 0);
        
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
                // accumulate capacity for riders (2 per unit)
                capacity += productItem.quantity * 2;
            }
            
            if (product.type === 'JetSki') {
                requiresLifeJacket = true;
            }
        }
        
        // Validate riders if equipment needed
        let numberOfRiders;
        if (requiresHelmet) {
            if (riders == null) {
                return res.status(400).json({ message: 'Number of riders is required for JetSki/ATV' });
            }
            if (riders < 1 || riders > capacity) {
                return res.status(400).json({ message: `Riders must be between 1 and ${capacity}` });
            }
            numberOfRiders = riders;
        }
        
        // Procesar equipo de seguridad por talla
        if (requiresHelmet || requiresLifeJacket) {
            if (!Array.isArray(safetyEquipmentRequested) || safetyEquipmentRequested.length === 0) {
                return res.status(400).json({ message: 'Safety equipment selection (type, size, quantity) is required.' });
            }

            let requestedHelmets = 0;
            let requestedJackets = 0;

            for (const item of safetyEquipmentRequested) {
                if (!item.type || !item.size || !item.quantity) {
                    return res.status(400).json({ message: 'Each safety equipment entry must include type, size and quantity.' });
                }
                if (item.quantity < 1) {
                    return res.status(400).json({ message: 'Safety equipment quantity must be at least 1.' });
                }

                if (item.type === 'Helmet') requestedHelmets += item.quantity;
                if (item.type === 'LifeJacket') requestedJackets += item.quantity;

                const equipmentDoc = await SafetyEquipment.findOne({ type: item.type, size: item.size, status: 'available' });
                if (!equipmentDoc || equipmentDoc.quantity < item.quantity) {
                    return res.status(400).json({ message: `Not enough ${item.type} size ${item.size} available` });
                }

                safetyEquipment.push({
                    equipment: equipmentDoc._id,
                    quantity: item.quantity
                });
            }

            if (requiresHelmet && requestedHelmets !== numberOfRiders) {
                return res.status(400).json({ message: `Helmets selected (${requestedHelmets}) must equal riders (${numberOfRiders})` });
            }
            if (requiresLifeJacket && requestedJackets !== numberOfRiders) {
                return res.status(400).json({ message: `Life jackets selected (${requestedJackets}) must equal riders (${numberOfRiders})` });
            }
        }
        
        let totalPrice = 0;
        
        for (const productItem of products) {
            const product = await Product.findById(productItem.product);
            totalPrice += product.price * productItem.quantity * slots.length;
        }
        
        let discount = 0;
        if (totalUnits > 1) {
            discount = totalPrice * 0.1;
            totalPrice -= discount;
        }
        
        const slotTime = Math.floor(slots[0] / 2); // Convert slot to hour
        const slotMinute = (slots[0] % 2) * 30;   // Get minute (0 or 30)
        
        // Construir fecha local utilizando componentes para evitar problemas de zona horaria
        let paymentDeadline;
        if (typeof date === 'string') {
            const [y, m, d] = date.split('-').map(Number);
            paymentDeadline = new Date(y, m - 1, d, slotTime, slotMinute, 0, 0);
        } else {
            // date ya es Date
            paymentDeadline = new Date(date);
            paymentDeadline.setHours(slotTime, slotMinute, 0, 0);
        }
        // Restar 2 horas para el límite de pago
        paymentDeadline.setHours(paymentDeadline.getHours() - 2);
        
        const reservation = new Reservation({
            customer: {
                name: customer.name,
                contact: customer.contact
            },
            products,
            safetyEquipment,
            date: reservationDate,
            slots,
            totalPrice,
            discount,
            paymentDeadline,
            paymentStatus: 'pending',
            createdBy: req.user.id
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
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const isOwner = reservation.customer && reservation.customer.id && reservation.customer.id.toString() === req.user.id;
        const isAdminOrStaff = req.user.role === 'admin' || req.user.role === 'staff';

        if (!isOwner && !isAdminOrStaff) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to cancel this reservation' });
        }

        const now = new Date();
        const reservationSlotTime = Math.floor(reservation.slots[0] / 2);
        const reservationSlotMinute = (reservation.slots[0] % 2) * 30;
        
        const slotTime = new Date(reservation.date);
        slotTime.setHours(reservationSlotTime, reservationSlotMinute, 0, 0);
        
        const cancellationDeadline = new Date(slotTime);
        cancellationDeadline.setHours(cancellationDeadline.getHours() - 2);
        
        if (now > cancellationDeadline && !isAdminOrStaff) {
            return res.status(403).json({ message: 'Cancellation window has passed. Only admins can cancel now.' });
        }
        
        // Marcar como cancelada
        reservation.cancellationStatus = 'canceled';
        
        let message = 'Reservation canceled successfully.';
        if (reservation.paymentStatus === 'paid') {
            if (now < cancellationDeadline) {
                reservation.paymentStatus = 'refunded';
                message = 'Reservation canceled. A full refund will be processed.';
            } else {
                message = 'Reservation canceled without refund as the cancellation window has passed.';
            }
        } else {
            // Si estaba pendiente, simplemente marcar el pago como cancelado
            reservation.paymentStatus = 'canceled';
        }
        
        await reservation.save();
        
        for (const productItem of reservation.products) {
            await releaseProductBookings(productItem.product, reservation.date, reservation.slots, productItem.quantity);
        }
        
        for (const equipmentItem of reservation.safetyEquipment) {
            await releaseEquipmentBookings(equipmentItem.equipment, reservation.date, reservation.slots, equipmentItem.quantity);
        }
        
        return res.status(200).json({ 
            message,
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
        
        reservation.cancellationStatus = 'storm refund';
        reservation.paymentStatus = 'partial refund';
        reservation.weatherCondition = 'storm';
        
        const refundAmount = reservation.totalPrice * 0.5;
        reservation.refundAmount = refundAmount;
        
        await reservation.save();
        
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
    processStormRefund,
    releaseProductBookings,
    releaseEquipmentBookings
};
