const multer = require('multer');
const sharp = require('sharp');
const TourModel = require('../model/tour');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const factory = require('./factory');

// const factory = require('./factory');

const catchAsync = fu => {
    return (req, res, next) => {
        fu(req, res, next).catch(err => { next(err); });
    };
};


// ---------------------- img --------------------
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

exports.resizingTourImages = async (req, res, next) => {
    // console.log(req.files);
    try {
        if (!req.files.imageCover || !req.files.images) return next();

        req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.body.imageCover}`); //image are stored in that location

        req.body.images = [];

        await Promise.all(
            req.files.images.map(async (file, i) => {
                const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/tours/${filename}`);

                req.body.images.push(filename);
            })
        );

        next(); //reached to update tour

    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in resizeUserPhoto", 500));
    }
};

exports.yearPlane = catchAsync(async (req, res) => {

    const year = (+req.params.year);
    console.log(year);
    const plane = await TourModel.aggregate(
        [
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    NoOfTour: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    NoOfTour: -1
                }
            }
        ]
    );
    res.status(201).json(
        {
            success: "ok", mes: "Tours",
            date: new Date().toISOString(),

            data: {
                plane
            }
        }
    );

});

exports.getTourStats = async (req, res) => {
    // console.log(first);

    try {
        const stats = await TourModel.aggregate(
            [
                {
                    $match: { ratingsAverage: { $gte: 4.5 } }
                },
                {
                    $group: {
                        _id: "$difficulty",
                        numOfTours: { $sum: 1 },
                        numRatings: { $sum: '$ratingsQuantity' },
                        avgRating: { $avg: '$ratingsAverage' },
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' },
                    },
                }
            ]
        );
        res.status(201).json(
            {
                success: "ok", mes: "Tours",
                data: {
                    stats
                }
            }
        );

    } catch (error) {
        if (error) {
            res.status(404).json(
                {
                    status: "fail", mes: error,
                    date: new Date().toISOString(),
                }
            );
        }
    }

};

// exports.Tours = async (req, res) => {

//     try {
//         //build a query
//         // const queryObject = { ...req.query };

//         // const excludeFields = ['page', 'sort', 'limit', 'fields'];
//         // excludeFields.forEach(field => delete queryObject[field]);

//         // // Advanced filtering
//         // let queryString = JSON.stringify(queryObject);
//         // queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => {
//         //     return `$${match}`;
//         // });

//         // console.log(JSON.parse(queryString));

//         // let query = TourModel.find(JSON.parse(queryString));



//         //sorting
//         // if (req.query.sort) {

//         //     const sortBy = req.query.sort.split(',').join(' ');
//         //     //sort('price duration)
//         //     console.log(sortBy);
//         //     query = query.sort(sortBy);
//         // }

//         // //fields
//         // if (req.query.fields) {

//         //     const Fields = req.query.fields.split(',').join(' ');
//         //     //sort('price duration)
//         //     console.log(Fields);
//         //     query = query.select(Fields);
//         // } else {
//         //     query = query.select('-__v');
//         // }

//         // //paging
//         // const page = (+req.query.page) || 1;
//         // const limit = (+req.query.limit) || 100;
//         // const skip = (page - 1) * limit;

//         // query = query.skip(skip).limit(limit);

//         // if (req.query.page) {

//         //     const countOfDocuments = await TourModel.countDocuments();
//         //     if (skip >= countOfDocuments) {
//         //         throw new Error("the page doesn't exist");
//         //     }

//         // }

//         // EXECUTE THE QUERY

//         const features = new APIFeatures(TourModel.find(), req.query).filter().sort().paginate().fields();

//         const Tour = await features.query;

//         res.status(201).json(
//             {
//                 success: "ok", mes: "Tour",
//                 result: Tour.length,
//                 date: new Date().toISOString(),
//                 data: Tour
//             }
//         );

//     } catch (err) {
//         console.log(err);
//         res.status(404).json(
//             {
//                 status: "internal error", mes: err,
//                 date: new Date().toISOString(),
//             }
//         );
//     }
// };

// exports.Tour = async (req, res) => {
//     // console.log(req.params.id);
//     try {

//         const singleTour = await TourModel.findById(req.params.id).populate('reviews').populate('guides');


//         res.status(201).json(
//             {
//                 success: "ok", mes: "Tour",
//                 result: singleTour.length,
//                 date: new Date().toISOString(),
//                 data: singleTour
//             }
//         );

//     } catch (err) {
//         console.log(err);
//         res.status(404).json(
//             {
//                 status: "fail", mes: "Tour",
//                 date: new Date().toISOString(),
//             }
//         );
//     }
// };

// exports.addTour = async (req, res) => {
//     try {
//         console.log("add tour");
//         const newTour = await TourModel.create(req.body);
//         console.log(newTour);
//         res.status(201).json(
//             {
//                 success: "ok", mes: "Tour",
//                 date: new Date().toISOString(),
//                 data: newTour
//             }
//         );

//     } catch (error) {
//         res.status(404).json(
//             {
//                 status: "fail", mes: "Tour",
//                 date: new Date().toISOString(),
//             }
//         );
//     }

// };

// exports.updateTour = async (req, res) => {
//     try {
//         console.log(req.body);

//         const updatedTour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });
//         // console.log(updatedTour);
//         res.status(201).json(
//             {
//                 success: "ok", mes: "Tour",
//                 date: new Date().toISOString(),
//                 data: updatedTour
//             }
//         );

//     } catch (err) {
//         res.status(404).json(
//             {
//                 status: "fail", mes: err,
//                 date: new Date().toISOString(),
//             }
//         );
//     }
// };

// exports.deleteTour = async (req, res) => {

//     try {
//         await TourModel.findByIdAndDelete(req.params.id);
//         res.status(201).json(
//             {
//                 success: "ok", mes: "Tour",
//                 date: new Date().toISOString(),
//             }
//         );

//     } catch (err) {
//         if (err) {
//             res.status(404).json(
//                 {
//                     status: "fail to delete", mes: err,
//                     date: new Date().toISOString(),
//                 }
//             );
//         }
//     }
// };

exports.Tours = factory.getAll(TourModel);
exports.Tour = factory.getOne(TourModel, { path: 'reviews' });
exports.deleteTour = factory.deleteOne(TourModel);
exports.updateTour = factory.updateOne(TourModel);
exports.addTour = factory.updateOne(TourModel);