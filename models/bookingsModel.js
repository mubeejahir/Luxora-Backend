const mongoose = require('mongoose');

const BookingsSchema = new mongoose.Schema({
    adminObjId : { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    guestObjId : { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
    roomId: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkInDate: { type: Date, required: true },
    numberOfGuests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    isPaid: { type: Boolean, default: false }   
}, { timestamps: true }
);

module.exports = mongoose.model('Bookings', BookingsSchema);