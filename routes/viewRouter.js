const express = require('express');
const router = express.Router();
const viewsController = require('../controller/viewRouter');
const Auth = require("../controller/auth");
const booking = require("../controller/booking");

// which are not protected
// router.use(Auth.isLogin);
router.get('/signUp', viewsController.signUp);

router.get('/', booking.createBookingCheckout, Auth.isLogin, viewsController.overview);

router.get('/tour/:slug', Auth.isLogin, viewsController.tour);
router.get('/login', Auth.isLogin, viewsController.loginForm);
router.get('/account', Auth.protect, viewsController.account);
router.get('/my-booking', Auth.protect, viewsController.getMyTour);

// router.post('/formData', Auth.protect, viewsController.updateForm);

module.exports = router;
