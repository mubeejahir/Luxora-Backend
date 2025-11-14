const HotelDetails = require("../models/HotelDetailsModel")
const AdminUser = require("../models/AdminUserModel")
const { cleanInput } = require("../utils/helper")

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
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const {
      adminObjId,
      roomName,
      description,
      pricePerNight,
      guest,
      bed,
      bath,
      amenities,
    } = req.body;

    const hotel = await HotelDetails.findOne({ adminObjId });
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found for this admin" });
    }

    // Handle images from memory storage
    const images = req.files?.map((file) => ({
      data: file.buffer.toString("base64"),
      contentType: file.mimetype,
    })) || [];

    // Build new room object
    const newRoom = {
      roomName,
      description,
      pricePerNight,
      amenities: Array.isArray(amenities) ? amenities : [amenities],
      details: {
        numberOfGuests: guest,
        numberOfBeds: bed,
        numberOfBathrooms: bath,
      },
      photos: images,
    };

    hotel.rooms.push(newRoom);
    await hotel.save();

    res.status(201).json({
      message: "Room added successfully",
      room: newRoom,
    });

  } catch (err) {
    console.error("postHotelDetails error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


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
exports.getAllRoomDetails = async (req, res) => {
	try {
		const hotels = await HotelDetails.find({}, "rooms")
		const allRooms = hotels.flatMap((hotel) => hotel.rooms)
		res.json({
			success: true,
			data: allRooms,
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: err.message,
		})
	}
}

//delete the cabins
exports.deleteHotelRoom = async (req, res) => {
	try {
		const { roomId } = req.query

		const hotel = await HotelDetails.findOne({ "rooms.roomId": roomId })
		if (!hotel) {
			return res.status(404).json({ error: "Room not found" })
		}

		// Remove this room
		await HotelDetails.updateOne(
			{ "rooms.roomId": roomId },
			{ $pull: { rooms: { roomId } } }
		)

		return res.json({ message: "Room deleted successfully" })
	} catch (err) {
		console.error("deleteRoom error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}

//Edit the cabins
exports.editHotelRoom = async (req, res) => {
	try {
		const { roomId } = req.query
		const updatedData = req.body

		if (!roomId) {
			return res.status(400).json({ error: "roomId is required" })
		}

		// Find the hotel containing this room
		const hotel = await HotelDetails.findOne({
			rooms: { $elemMatch: { roomId } },
		})

		if (!hotel) {
			return res.status(404).json({ error: "Room not found" })
		}

		// Find the exact room object
		const roomIndex = hotel.rooms.findIndex((r) => r.roomId === roomId)

		if (roomIndex === -1) {
			return res.status(404).json({ error: "Room not found inside hotel" })
		}

		// Merge existing room with updated data
		const updatedRoom = {
			...hotel.rooms[roomIndex].toObject(),
			...updatedData,
			details: {
				...hotel.rooms[roomIndex].details.toObject(),
				...(updatedData.details || {}),
			},
		}

		// Update room in array
		hotel.rooms[roomIndex] = updatedRoom

		await hotel.save()

		res.json({
			message: "Room updated successfully",
			room: updatedRoom,
		})
	} catch (err) {
		console.error("updateHotelRoom error:", err)
		res.status(500).json({ error: "Internal server error" })
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

//search hotel rooms
exports.searchHotels = async (req, res) => {
	try {
		const destination = cleanInput(req.query.destination)
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const skip = (page - 1) * limit

		// console.log(destination)

		// Step 1: Build filter
		const matchStage = destination
			? { "adminData.hotelAddress": { $regex: new RegExp(destination, "i") } }
			: {}

		// Step 2: Aggregate to fetch rooms by destination
		const rooms = await HotelDetails.aggregate([
			// Join with AdminUser to access hotel details
			{
				$lookup: {
					from: "adminusers",
					localField: "adminObjId",
					foreignField: "_id",
					as: "adminData",
				},
			},
			{ $unwind: "$adminData" },

			// Apply destination filter
			{ $match: matchStage },

			// Unwind rooms array to get individual room documents
			{ $unwind: "$rooms" },

			// Sort (optional)
			{ $sort: { "rooms.roomName": 1 } },

			// Pagination
			{ $skip: skip },
			{ $limit: limit },

			// Select only the needed fields
			{
				$project: {
					_id: 0,
					roomId: "$rooms.roomId",
					roomName: "$rooms.roomName",
					description: "$rooms.description",
					pricePerNight: "$rooms.pricePerNight",
					amenities: "$rooms.amenities",
					isAvailable: "$rooms.isAvailable",
					hotelName: "$adminData.hotelName",
					hotelAddress: "$adminData.hotelAddress",
					photos: "$rooms.photos",
				},
			},
		])

		// Step 3: Count total rooms (for pagination)
		const totalCountPipeline = [
			{
				$lookup: {
					from: "adminusers",
					localField: "adminObjId",
					foreignField: "_id",
					as: "adminData",
				},
			},
			{ $unwind: "$adminData" },
			{ $match: matchStage },
			{ $unwind: "$rooms" },
			{ $count: "totalRooms" },
		]

		const totalResult = await HotelDetails.aggregate(totalCountPipeline)
		const totalRooms = totalResult[0]?.totalRooms || 0

		// Step 4: Send response
		if (!rooms.length) {
			return res.status(404).json({ message: "No rooms found" })
		}

		res.status(200).json({
			success: true,
			totalRooms,
			currentPage: page,
			totalPages: Math.ceil(totalRooms / limit),
			data: rooms,
		})
	} catch (err) {
		console.error("Search Error:", err)
		res.status(500).json({
			success: false,
			message: "Server error",
		})
	}
}
