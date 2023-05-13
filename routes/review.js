const express = require('express');
const Review = require("../controller/review");
const Auth = require("../controller/auth");

const router = express.Router({ mergeParams: true });

router.get("/", Review.reviews);
router.post("/", Auth.protect, Auth.restrictTo('user'), Review.createReview);

module.exports = router


