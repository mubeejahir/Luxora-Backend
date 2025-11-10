const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")

const HotelDetailsSchema = new mongoose.Schema({
	adminObjId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
	rooms: [
		{
			roomId: { type: String, default: uuidv4, unique: true },
			roomName: { type: String, required: true },
			photos: {},
			description: { type: String, required: true },
			details: {
				numberOfGuests: { type: Number, required: true },
				numberOfBeds: { type: Number, required: true },
				numberOfBathrooms: { type: Number, required: true },
			},
			pricePerNight: { type: Number, required: true },
			amenities: { type: [String], required: true },
			isAvailable: { type: Boolean, default: true },
		},
	],
	settings: {
		minNightsStay: { type: Number, default: 1 },
		maxNightsStay: { type: Number, default: 10 },
		maxGuestsPerRoom: { type: Number, default: 4 },
	},
})

module.exports = mongoose.model("HotelDetails", HotelDetailsSchema)
