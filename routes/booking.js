const express = require('express');
const Booking = require("../controller/booking");
const Auth = require("../controller/auth");

const router = express.Router();
router.get("/my-booking", Auth.protect, Booking.getAllBooking);

router.get("/check-out/:tourId", Auth.protect, Booking.getCheckoutSession);

module.exports = router


