const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sampleController');
const guestController = require('../controllers/GuestController');
const adminUserController = require('../controllers/AdminUserController');
const hotelDetailsController = require('../controllers/HotelDetailsController');
const bookingsController = require('../controllers/BookingsController'); 

// Sample route
router.get('/sample', sampleController.getSample);

//guest routes
router.post('/guest/register', guestController.registerGuest);
router.get('/guest/login', guestController.loginGuest);

//admin user routes 
router.post('/admin/register', adminUserController.registerAdminUser);
router.get('/admin/login', adminUserController.loginAdminUser);

//hotel details routes
router.post('/hotel/details', hotelDetailsController.postHotelDetails);
router.get('/hotel/details', hotelDetailsController.getHotelDetailsByAdminId);

//bookings routes
router.post('/bookings/create', bookingsController.createBooking);
router.get('/bookings/:id', bookingsController.getBookingById);

module.exports = router;
