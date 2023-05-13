const ReviewModel = require('../model/review');
const AppError = require('../utils/appError');

exports.reviews = async (req, res, next) => {

    let filter = {};

    if (req.params.tourId) {
        filter = { tour: req.params.tourId };
    }

    const body = (req.body);
    console.log(body);
    try {
        const review = await ReviewModel.find(filter);
        res.status(201).json(
            {
                success: "ok", mes: "User",
                length: review.length,

                date: new Date().toISOString(),
                review
            }
        );

    } catch (error) {
        console.log(error);
        return next(new AppError(" error in reviews", 403));

    }
};




exports.addReview = async (req, res, next) => {
    console.log("addReview");
    console.log(req.body);
    try {

        const review = await ReviewModel.create(req.body);
        res.status(201).json(
            {
                success: "ok", mes: "Review added successfully",
                date: new Date().toISOString(),
                review
            }
        );

    } catch (error) {
        console.log(error);
        return next(new AppError(" error in addReview", 404));
    }

};

exports.createReview = async (req, res, next) => {
    console.log("createReview");

    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    console.log(req.body);

    try {

        const review = await ReviewModel.create(req.body);
        res.status(201).json(
            {
                success: "ok", mes: "Review added successfully",
                date: new Date().toISOString(),
                review
            }
        );

    } catch (error) {
        console.log(error);
        return next(new AppError(" error in createReview", 404));
    }
};

exports.deleteMe = async (req, res, next) => {

    try {
        const User = await reviewModel.findByIdAndUpdate(
            req.user.id, { active: false }
        );

        return res.status(201).json(
            {
                success: "ok", mess: "delete successfully (means active = false) ",
                data: {
                    user: User

                }
            }
        );

    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in deleteMe", 500));
    }
}




