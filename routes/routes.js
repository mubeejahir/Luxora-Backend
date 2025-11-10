const express = require("express")
const router = express.Router()
const guestController = require("../controllers/GuestController")
const adminUserController = require("../controllers/AdminUserController")
const hotelDetailsController = require("../controllers/HotelDetailsController")
const bookingsController = require("../controllers/BookingsController")
const homeController = require("../controllers/HomeController")
const authController = require("../controllers/AuthController")

//guest routes
router.post("/guest/signup", authController.registerGuest)
router.post("/guest/login", authController.loginGuest)
router.get("/guest/all", guestController.getAllGuests)

//admin user routes
router.post("/admin/register", adminUserController.registerAdminUser)
router.post("/admin/login", adminUserController.loginAdminUser)

//hotel details routes
router.post("/hotel/data", hotelDetailsController.postData)
router.post("/hotel/details", hotelDetailsController.postHotelDetails)
router.get("/hotel/details", hotelDetailsController.getHotelDetailsByAdminId)
router.patch("/hotel/details", hotelDetailsController.updateHotelSettings)
//get all room details for LP
router.get("/hotel/allDetails", authController.protect, hotelDetailsController.getAllRoomDetails) //todo: use this in LP hotelsection after authentication

//bookings routes
router.post("/bookings/create", bookingsController.createBooking)
router.get("/bookings/id", bookingsController.getBookingById)
router.get("/bookings", bookingsController.getAllBookings)

//home routes
router.get("/home/count", homeController.getBookingsCount)

module.exports = router
