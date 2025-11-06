const HotelDetails = require('../models/HotelDetailsModel');

// post hotel details
exports.postHotelDetails = async (req, res) => {
    try {
        const { adminObjId, rooms, settings } = req.body;  
        const newHotelDetails = await HotelDetails.create({ adminObjId, rooms, settings });
        res.status(201).json({ message: 'Hotel details added successfully', hotelDetailsId: newHotelDetails._id });
    } catch (err) {
        console.error('postHotelDetails error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// get hotel details by admin ID
exports.getHotelDetailsByAdminId = async (req, res) => {
    try {
        const { adminObjId } = req.query;
        const hotelDetails = await HotelDetails.findOne({ adminObjId }).lean();
        if (!hotelDetails) {
            return res.status(404).json({ error: 'Hotel details not found' });
        }           
        res.json({ message: 'Hotel details retrieved successfully', hotelDetails });
    } catch (err) {
        console.error('getHotelDetailsByAdminId error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }       
};