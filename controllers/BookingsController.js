const mongoose = require("mongoose");

const Bookings = require("../models/bookingsModel");
const Room = require("../models/HotelDetailsModel");
const {cleanInput} = require("../utils/helper")

exports.createBooking = async (req, res) => {
	try {
		const {
			adminObjId,
			guestObjId,
			roomId,
			checkInDate,
			checkOutDate,
			numberOfGuests,
			totalPrice,
			bookingStatus,
		} = req.body
		const newBooking = await Bookings.create({
			adminObjId,
			guestObjId,
			roomId,
			checkInDate,
			checkOutDate,
			numberOfGuests,
			totalPrice,
			bookingStatus,
		})
		res.status(201).json({
			message: "Booking created successfully",
			bookingId: newBooking._id,
		})
	} catch (err) {
		console.error("createBooking error:", err)
		res.status(500).json({ message: err.message })
	}
}

exports.getBookingById = async (req, res) => {
	try {
		const { id } = req.query
		const booking = await Bookings.findById(id).lean()
		if (!booking) return res.status(404).json({ error: "Booking not found" })
		res.json({ message: "booking retrieved successfully", booking })
	} catch (err) {
		console.error("getBookingById error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}

exports.getAllBookings = async (req, res) => {
    const offset = cleanInput(req.query.offset) || 0
    const limit = cleanInput(req.query.limit) || 20
    console.log(offset, limit)
	try {
		const adminId = req.query.id
		const bookings = await Bookings.aggregate([
			{
				$match: {
					adminObjId:new mongoose.Types.ObjectId(adminId),
				},
			},
			{
				$lookup: {
					from: "guests",
					localField: "guestObjId",
					foreignField: "_id",
					as: "guestDetails",
				},
			},
			{ $unwind: "$guestDetails" },
			{
				$lookup: {
					from: "hoteldetails",
					let: { adminId: "$adminObjId", roomId: "$roomId" },
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: [
										"$adminObjId",
										"$$adminId",
									],
								},
							},
						},
						{ $unwind: "$rooms" },
						{
							$match: {
								$expr: {
									$eq: [
										"$rooms.roomId",
										"$$roomId",
									],
								},
							},
						},
						{
							$project: {
								_id: 0,
								roomName: "$rooms.roomName",
							},
						},
					],
					as: "roomDetails",
				},
			},

			{
				$set: {
					roomName: { $arrayElemAt: ["$roomDetails.roomName", 0] },
				},
			},

			{
				$project: {
					_id: 0,
					roomName: 1,
					guestName: "$guestDetails.fullName",
					checkInDate: 1,
					checkOutDate: 1,
					bookingStatus: 1,
					totalPrice: 1,
				},
			},

            { $sort: { createdAt: -1 } }, 
            { $skip: offset },
			{ $limit: limit },
		])
		if (!bookings) return res.status(404).json({ error: "Bookings not found" })
		res.json({ message: "booking retrieved successfully", bookings })
	} catch (err) {
		console.error("getAllBookings error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}



//stripe
exports.stripePayment = async (req,res) =>{
	try{
		const {bookingId} = req.body;
		const booking = await Bookings.findById(bookingId);//booking model
		const roomData = await Room.findById(booking.room).populate('hotel');
		const totalPrice = booking.totalPrice;
		const {origin}	= req.headers;	

	}catch (err) {
		console.error("Payment error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}