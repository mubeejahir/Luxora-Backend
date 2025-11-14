const express = require("express")
const router = express.Router()
const uploadMemory = require("../middlewares/uploadMemory");
const guestController = require("../controllers/GuestController")
const hotelDetailsController = require("../controllers/HotelDetailsController")
const bookingsController = require("../controllers/BookingsController")
const homeController = require("../controllers/HomeController")
const authController = require("../controllers/AuthController")

//guest routes
router.post("/guest/signup", authController.registerGuest)
router.post("/guest/login", authController.loginGuest)
router.get("/guest/all", guestController.getAllGuests)

//admin user routes
router.post("/admin/register", authController.registerAdmin)
router.post("/admin/login", authController.loginAdmin)

//hotel details routes
router.post("/hotel/data", hotelDetailsController.postData)
router.post("/hotel/details",uploadMemory.array("photos", 1), hotelDetailsController.postHotelDetails)
router.get("/hotel/details", hotelDetailsController.getHotelDetailsByAdminId)
router.patch("/hotel/details", hotelDetailsController.updateHotelSettings)
router.delete("/hotel/delete", hotelDetailsController.deleteHotelRoom)
router.put("/hotel/edit", hotelDetailsController.editHotelRoom)
//get all room details for LP
router.get("/hotel/allDetails/protect", authController.protect, hotelDetailsController.getAllRoomDetails) //todo: use this in LP hotelsection after authentication
router.get("/hotel/allDetails", hotelDetailsController.getAllRoomDetails)
router.get("/hotel/search", hotelDetailsController.searchHotels)

//bookings routes
router.post("/bookings/create",  authController.protect, bookingsController.createBooking)
router.delete("/bookings/delete", bookingsController.deleteBooking)
router.get("/bookings/id", bookingsController.getBookingById)
router.get("/bookings", bookingsController.getAllBookings)
router.get("/bookings/check-availability", bookingsController.checkRoomAvailability)

//home routes
router.get("/home/count", homeController.getBookingsCount)

//stripe
router.post("/stripe/checkout-session", authController.protect, bookingsController.getCheckOutSession)

module.exports = router
