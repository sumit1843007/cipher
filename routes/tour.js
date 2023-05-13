const express = require('express');
const tours = require("../controller/tour");
const Auth = require("../controller/auth");
const ReviewRouter = require("../routes/review");

const router = express.Router();

router.use('/:tourId/reviews', ReviewRouter);


// const middleware = (req, res, next, val) => {
//     const id = req.params.id;
//     console.log("middleware called");
//     // console.log(val);
//     if ((+id) > data.length - 1) {
//         return res.status(201).json({
//             success: "error", mes: "invalid id",
//         });
//     }
//     next();
// };


// router.param('id', middleware);


router.route("/tour-stats").get(tours.getTourStats);
router.route("/year-plane/:year").get(Auth.protect, Auth.restrictTo('admin', 'lead-guide', 'user'), tours.yearPlane);

// router.get("/", tours.Tours);
// router.post("/", tours.addTour);

// router.get("/:id", middleware, tours.Tour);
// router.patch("/:id", middleware, tours.updateTour);

// router.delete("/:id", middleware, tours.deleteTour);


router.route("/").get(tours.Tours)
    .post(Auth.protect, Auth.restrictTo('admin', 'lead-guide'), tours.addTour);

router.route('/:id')
    .get(tours.Tour)
    .patch(Auth.protect, Auth.restrictTo('admin', 'lead-guide'), tours.updateTour)
    .delete(Auth.protect, Auth.restrictTo('admin', 'lead-guide'), tours.deleteTour);

// router.route("/:tourId/reviews").post(Auth.protect, Auth.restrictTo('user'), Review.createReview);


module.exports = router


