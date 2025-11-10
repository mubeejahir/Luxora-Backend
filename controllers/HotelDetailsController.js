const HotelDetails = require("../models/HotelDetailsModel")

//post data from postman
exports.postData = async (req, res) => {
	try {
		const { adminObjId, rooms, settings } = req.body
		const newBooking = await HotelDetails.create({ adminObjId, rooms, settings })
		res.status(201).json({
			message: "Hotel details created successfully",
			bookingId: newBooking._id,
		})
	} catch (err) {
		console.error("createBooking error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}

// post hotel details from cabin
exports.postHotelDetails = async (req, res) => {
	try {
		console.log(req.body)
		const { adminObjId, newRoom } = req.body
		const hotel = await HotelDetails.findOne({ adminObjId })
		if (!hotel) {
			return res.status(404).json({ error: "Hotel not found for this admin" })
		}
		hotel.rooms.push(newRoom)
		await hotel.save()
		res.status(201).json({ message: "Room added successfully", hotel })
	} catch (err) {
		console.error("postHotelDetails error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}

// get hotel details by admin ID
exports.getHotelDetailsByAdminId = async (req, res) => {
	try {
		const { adminObjId } = req.query
		const hotelDetails = await HotelDetails.findOne({ adminObjId }).lean()
		if (!hotelDetails) {
			return res.status(404).json({ error: "Hotel details not found" })
		}
		res.json({ message: "Hotel details retrieved successfully", hotelDetails })
	} catch (err) {
		console.error("getHotelDetailsByAdminId error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}

//get all hotel room details for LP
exports.getAllRoomDetails = async  (req,res)=> {
	try{
		const hotels = await HotelDetails.find({}, "rooms")
		const allRooms = hotels.flatMap(hotel => hotel.rooms)
	res.json({
      success: true,
      data: allRooms,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
}
}

//update the setting
exports.updateHotelSettings = async (req, res) => {
	try {
		const { adminObjId } = req.query
		const updateSetting = await HotelDetails.findOneAndUpdate(
			{ adminObjId },
			{
				$set: {
					settings: req.body.settings,
				},
			},
			{ new: true }
		)
		if (!updateSetting) {
			return res
				.status(404)
				.json({ error: "setting is not found for this admin" })
		}
		// return the updated document along with a message
		res.json({ message: "Settings updated successfully", hotel: updateSetting })
	} catch (err) {
		console.error("updating the hotel setting error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}
