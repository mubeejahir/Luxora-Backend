
const Bookings = require("../models/bookingsModel")

exports.getBookingsCount = async (req, res) => {
  try {
    const count = await Bookings.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: "Internal server error"  });
  }
};