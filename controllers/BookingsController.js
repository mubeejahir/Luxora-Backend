const Bookings = require('../models/bookingsModel');

exports.createBooking = async (req, res) => {
    try {
        const { adminObjId, guestObjId, roomId, checkInDate, checkOutDate, numberOfGuests, totalPrice, bookingStatus } = req.body;
        const newBooking = await Bookings.create({ adminObjId, guestObjId, roomId, checkInDate, checkOutDate, numberOfGuests, totalPrice, bookingStatus });
        res.status(201).json({ message: 'Booking created successfully', bookingId: newBooking._id });
    } catch (err) {
        console.error('createBooking error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }       
};

exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Bookings.findById(id).lean();
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'booking retrieved successfully' , booking});
    }   catch (err) {       
        console.error('getBookingById error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }   
};