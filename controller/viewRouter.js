const TourModel = require('../model/tour');
const UserModel = require('../model/user');
const BookingModel = require('../model/booking');
const AppError = require('../utils/appError');


exports.overview = async (req, res, next) => {
    try {
        const tours = await TourModel.find();

        res.status(201).render('overview', {
            title: "c",
            heading: "Welcome overview",
            tours

        });
    } catch (error) {
        return next(new AppError("error occurred in overview "));

    }
};

exports.tour = async (req, res, next) => {

    try {
        const prams = req.params.slug;
        // console.log(prams);

        const tour = await TourModel.findOne({ slug: prams }).populate({
            path: 'reviews',
            fields: 'review rating user'
        }).populate({
            path: 'guides',
            fields: 'name photo'
        });

        if (!tour) {
            return res.status(200).render('error', {
                title: 'My Tours',
                error: "this title is not found in the tour"
            });
            // return next(new AppError("this title is not found in the tour", 400));

        }
        // console.log(tour);
        res.status(404).render('tour', {
            title: "tour page",
            heading: "Welcome tour",
            tour
        });
    } catch (error) {
        return next(new AppError("error occurred in tour page"));

    }
};

exports.loginForm = async (req, res, next) => {
    try {
        console.log("login view");
        res.status(404).render('login', {
            title: "Login",
        });
    } catch (error) {
        return next(new AppError("page not render", 400));

    }
};

exports.signUp = async (req, res, next) => {
    try {
        console.log("signUp ");
        res.status(404).render('signUp', {
            title: "signUp",
        });
    } catch (error) {
        return next(new AppError("page not render", 400));

    }
};

exports.account = async (req, res, next) => {

    try {
        console.log("account view");
        res.status(404).render('account', {
            title: "Me",

        });
    } catch (error) {
        return next(new AppError("page not render", 400));

    }
};

exports.getMyTour = async (req, res, next) => {

    try {
        console.log("getMyTour");
        // 1) Find all bookings
        const bookings = await BookingModel.find({ user: req.user.id });

        // 2) Find tours with the returned IDs
        const tourIDs = bookings.map(el => el.tour);
        const tours = await TourModel.find({ _id: { $in: tourIDs } });
        console.log({ tours });
        if (tours.length === 0) {
            return res.status(200).render('error', {
                title: 'error',
                error: "No Booking Found"
            });
        }

        // console.log(tours);

        res.status(200).render('overview', {
            title: 'My Tours',
            tours
        });
    } catch (error) {
        console.log(error);


        return next(new AppError(" getMyTour page not render", 400));

    }
};

// exports.updateForm = async (req, res) => {
//     console.log("update", req.user.id);
//     console.log(req.body);

//     const updateUser = await UserModel.findByIdAndUpdate(
//         req.user.id,
//         { name: req.body.name, email: req.body.email },
//         { new: true, runValidators: true }
//     );

//     res.status(404).render('account', {
//         title: "account",
//         user: updateUser

//     });
// };