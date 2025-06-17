/**
 * Cron job que revisa cada 15 minutos si hay reservas pendientes de pago
 * cuyo deadline ya expiró. Si es así, las cancela para liberar los cupos.
 */
const cron = require('node-cron');
const Reservation = require('../models/ReservationModel');

// Ejecutar cada 15 minutos (*/15 * * * *)
cron.schedule('*/15 * * * *', async () => {
  const now = new Date();
  try {
    const result = await Reservation.updateMany(
      {
        paymentStatus: 'pending',
        paymentDeadline: { $lt: now },
        cancellationStatus: 'none'
      },
      {
        $set: {
          paymentStatus: 'canceled',
          cancellationStatus: 'payment-expired'
        }
      }
    );
    if (result.modifiedCount) {
      console.log(`[Cron] Reservas liberadas por falta de pago: ${result.modifiedCount}`);
    }
  } catch (err) {
    console.error('[Cron] Error en cleanup de reservas:', err);
  }
});

module.exports = {};
