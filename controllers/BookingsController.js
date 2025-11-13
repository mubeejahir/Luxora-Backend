const mongoose = require("mongoose")
const Stripe = require("stripe")
const Bookings = require("../models/bookingsModel")
const HotelDetails = require("../models/HotelDetailsModel")
const { cleanInput } = require("../utils/helper")
const HotelDetailsModel = require("../models/HotelDetailsModel")
//for postman
// exports.createBooking = async (req, res) => {
// 	try {
// 		const {
// 			adminObjId,
// 			guestObjId,
// 			roomId,
// 			checkInDate,
// 			checkOutDate,
// 			numberOfGuests,
// 			totalPrice,
// 			bookingStatus,
// 		} = req.body
// 		const newBooking = await Bookings.create({
// 			adminObjId,
// 			guestObjId,
// 			roomId,
// 			checkInDate,
// 			checkOutDate,
// 			numberOfGuests,
// 			totalPrice,
// 			bookingStatus,
// 		})
// 		res.status(201).json({
// 			message: "Booking created successfully",
// 			bookingId: newBooking._id,
// 		})
// 	} catch (err) {
// 		console.error("createBooking error:", err)
// 		res.status(500).json({ message: err.message })
// 	}
// }

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

//all bookings
exports.getAllBookings = async (req, res) => {
	try {
		const offset = Number(req.query.offset) || 0
		const limit = Number(req.query.limit) || 20

		const adminId = req.query.adminId
		const guestId = req.query.guestId

		if (!adminId && !guestId) {
			return res.status(400).json({ error: "adminId or guestId is required" })
		}

		// Dynamic filter
		let filter = {}
		if (adminId) filter.adminObjId = new mongoose.Types.ObjectId(adminId)
		if (guestId) filter.guestObjId = new mongoose.Types.ObjectId(guestId)

		const bookings = await Bookings.aggregate([
			{
				$match: filter,
			},

			// Lookup guest details
			{
				$lookup: {
					from: "guests",
					localField: "guestObjId",
					foreignField: "_id",
					as: "guestDetails",
				},
			},
			{ $unwind: "$guestDetails" },

			// Lookup room + roomName from hotel details
			{
				$lookup: {
					from: "hoteldetails",
					let: {
						adminId: "$adminObjId",
						roomId: "$roomId",
					},
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
								hotelName: "$hotelName",
								hotelAddress: "$hotelAddress",
							},
						},
					],
					as: "roomDetails",
				},
			},

			{
				$set: {
					roomName: { $arrayElemAt: ["$roomDetails.roomName", 0] },
					hotelName: { $arrayElemAt: ["$roomDetails.hotelName", 0] },
					hotelAddress: {
						$arrayElemAt: ["$roomDetails.hotelAddress", 0],
					},
				},
			},

			{
				$lookup: {
					from: "adminusers",
					localField: "adminObjId",
					foreignField: "_id",
					as: "adminDetails",
				},
			},
			{ $unwind: "$adminDetails" },
			{
				$set: {
					hotelAddress: "$adminDetails.hotelAddress",
				},
			},

			{
				$project: {
					_id: 1,
					guestName: "$guestDetails.fullName",
					roomName: 1,
					hotelName: 1,
					hotelAddress: 1,
					checkInDate: 1,
					checkOutDate: 1,
					numberOfGuests: 1,
					totalPrice: 1,
					bookingStatus: 1,
					isPaid: 1,
					createdAt: 1,
					updatedAt: 1,
				},
			},

			{ $sort: { createdAt: -1 } },
			{ $skip: offset },
			{ $limit: limit },
		])

		res.json({
			message: "Bookings retrieved successfully",
			bookings,
		})
	} catch (err) {
		console.error("getBookings error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}

//check room availability
exports.checkRoomAvailability = async (req, res) => {
	try {
		const { checkInDate, checkOutDate, numberOfGuests, roomId } = req.query

		if (!checkInDate || !checkOutDate || !roomId || !numberOfGuests) {
			return res.status(400).json({ error: "Missing required parameters" })
		}

		const checkIn = new Date(checkInDate)
		const checkOut = new Date(checkOutDate)

		if (checkOut <= checkIn) {
			return res
				.status(400)
				.json({ error: "Check-out date must be after check-in date" })
		}

		// ✅ Step 1: Find the specific room
		const hotel = await HotelDetails.findOne(
			{ "rooms.roomId": roomId },
			{ "rooms.$": 1 }
		)

		if (!hotel) {
			return res.status(404).json({ error: "Room not found" })
		}

		const room = hotel.rooms[0]

		// ✅ Step 2: Check if the room is marked as available in HotelDetails
		if (!room.isAvailable) {
			return res.status(200).json({
				available: false,
				message: "Room is currently unavailable for booking.",
			})
		}

		// ✅ Step 3: Check guest capacity
		if (parseInt(numberOfGuests) > room.details.numberOfGuests) {
			return res.status(400).json({
				available: false,
				message: `Room can accommodate up to ${room.details.numberOfGuests} guests only.`,
			})
		}

		// ✅ Step 4: Check if there’s an overlapping booking
		const overlappingBooking = await Bookings.findOne({
			roomId,
			bookingStatus: { $in: ["booked", "checked-in"] },
			$or: [
				{
					checkInDate: { $lt: checkOut },
					checkOutDate: { $gt: checkIn },
				},
			],
		})

		// ✅ Step 5: Final availability response
		if (overlappingBooking) {
			return res.status(200).json({
				available: false,
				message: "Room is already booked for the selected dates.",
			})
		}

		return res.status(200).json({
			available: true,
			message: "Room is available for the selected dates.",
			roomDetails: {
				roomName: room.roomName,
				pricePerNight: room.pricePerNight,
				maxGuests: room.details.numberOfGuests,
			},
		})
	} catch (err) {
		console.error("checkRoomAvailability error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}

//create bookings
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
		} = req.body

		if (
			!adminObjId ||
			!guestObjId ||
			!roomId ||
			!checkInDate ||
			!checkOutDate ||
			!numberOfGuests ||
			!totalPrice
		) {
			return res.status(400).json({
				error: "All required fields must be provided.",
			})
		}

		// Convert admin ID safely
		const adminId = mongoose.Types.ObjectId.isValid(adminObjId)
			? new mongoose.Types.ObjectId(adminObjId)
			: adminObjId

		// Convert dates
		const checkIn = new Date(checkInDate)
		const checkOut = new Date(checkOutDate)

		if (checkOut <= checkIn) {
			return res.status(400).json({
				error: "Check-out date must be after check-in date.",
			})
		}

		console.log("Incoming adminObjId:", adminObjId)
		console.log("Converted adminObjId:", adminId)
		console.log("Incoming roomId:", roomId)

		// Find hotel and room (roomId is STRING)
		const hotel = await HotelDetails.findOne({
			adminObjId: adminId,
			"rooms.roomId": roomId, // match as string
		})

		if (!hotel) {
			return res.status(404).json({
				error: "Room not found under this admin.",
			})
		}

		// Find room inside hotel
		const room = hotel.rooms.find((r) => r.roomId === roomId)

		if (!room || !room.isAvailable) {
			return res.status(400).json({
				error: "Room not available for booking.",
			})
		}

		// Check overlapping bookings
		const overlappingBooking = await Bookings.findOne({
			roomId,
			bookingStatus: { $ne: "cancelled" },
			checkInDate: { $lte: checkOut },
			checkOutDate: { $gte: checkIn },
		})

		if (overlappingBooking) {
			return res.status(400).json({
				error: "Room is already booked for these dates.",
			})
		}

		// Create booking
		const newBooking = await Bookings.create({
			adminObjId: adminId,
			guestObjId,
			roomId,
			checkInDate: checkIn,
			checkOutDate: checkOut,
			numberOfGuests,
			totalPrice,
			bookingStatus: "booked",
			isPaid: false,
		})

		// Update room availability
		await HotelDetails.updateOne(
			{ "rooms.roomId": roomId },
			{ $set: { "rooms.$.isAvailable": false } }
		)

		res.status(201).json({
			message: "Booking successful!",
			booking: newBooking,
		})
	} catch (err) {
		console.error("Error creating booking:", err)
		res.status(500).json({
			error: "Internal server error",
		})
	}
}

//stripe
// exports.getCheckOutSession = async (req,res) =>{
// 	try{
// 		const {bookingId} = req.body;
// 		const booking = await Bookings.findById(bookingId);//booking model
// 		const roomData = await HotelDetailsModel.findById(booking.roomId).populate('hotel');//room Id
// 		const totalPrice = booking.totalPrice;
// 		// const {origin}	= req.headers;

// 		const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
// 		const line_items = [
// 			{
// 				price_data: {
// 					currency : "inr",
// 					product_data: {
// 						name:roomData.hotel.name, //roomName
// 					},
// 					unit_amount: totalPrice * 100
// 				},
// 				quantity: 1,
// 			}
// 		]
// 		//create checkout session
// 		const session = await stripeInstance.checkout.sessions.create({
// 			line_items,
// 			mode: "payment",
// 			success_url: `${origin}/loader/bookings`,
// 			cancel_url: `${origin}/bookings`,
// 			metadata: {
// 				bookingId
// 			}
// 		})
// 		res.json({success: true, url: session.url})

// 	}catch (err) {
// 		console.error("Payment error:", err)
// 		res.json({success: false, message: "payment Failed"})
// 	}
// }
exports.getCheckOutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Bookings.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const roomId = booking.roomId;

    const hotelWithRoom = await HotelDetailsModel.findOne({
      "rooms.roomId": roomId,
    });
    if (!hotelWithRoom) throw new Error("Hotel not found for this room");

    const roomData = hotelWithRoom.rooms.find(r => r.roomId === roomId);

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],  // <-- IMPORTANT
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: roomData.roomName },
            unit_amount: booking.totalPrice * 100,
          },
          quantity: 1,
        },
      ],

      metadata: {
        bookingId: bookingId.toString(), // <-- THIS MUST WORK NOW
      },

      success_url: `${req.headers.origin}/loader/bookings`,
      cancel_url: `${req.headers.origin}/bookings`,
    });

    // Debug: See if metadata is actually added
    console.log("Created session metadata:", session.metadata);

    res.json({ success: true, url: session.url });

  } catch (err) {
    console.error("Payment error:", err);
    res.json({ success: false, message: err.message });
  }
};


// exports.getCheckOutSession = async (req,res) =>{
// 	//1. get the currently booked tour
// 	const {bookingId} = req.query;
// 	const booking = await Bookings.findById(bookingId)

// 	//2.create checkout session
// 	stripe.checkout.session.create
// 	//3.create session as response
// }
