const TourModel = require('../model/tour');
const APIFeatures = require('../utils/apiFeatures');

const factory = require('./factory');

const catchAsync = fu => {
    return (req, res, next) => {
        fu(req, res, next).catch(err => { next(err); });
    };
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

exports.Tours = async (req, res) => {

    try {
        //build a query
        // const queryObject = { ...req.query };

        // const excludeFields = ['page', 'sort', 'limit', 'fields'];
        // excludeFields.forEach(field => delete queryObject[field]);

        // // Advanced filtering
        // let queryString = JSON.stringify(queryObject);
        // queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => {
        //     return `$${match}`;
        // });

        // console.log(JSON.parse(queryString));

        // let query = TourModel.find(JSON.parse(queryString));



        //sorting
        // if (req.query.sort) {

        //     const sortBy = req.query.sort.split(',').join(' ');
        //     //sort('price duration)
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        // }

        // //fields
        // if (req.query.fields) {

        //     const Fields = req.query.fields.split(',').join(' ');
        //     //sort('price duration)
        //     console.log(Fields);
        //     query = query.select(Fields);
        // } else {
        //     query = query.select('-__v');
        // }

        // //paging
        // const page = (+req.query.page) || 1;
        // const limit = (+req.query.limit) || 100;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {

        //     const countOfDocuments = await TourModel.countDocuments();
        //     if (skip >= countOfDocuments) {
        //         throw new Error("the page doesn't exist");
        //     }

        // }

        // EXECUTE THE QUERY

        const features = new APIFeatures(TourModel.find(), req.query).filter().sort().paginate().fields();

        const Tour = await features.query;

        res.status(201).json(
            {
                success: "ok", mes: "Tour",
                result: Tour.length,
                date: new Date().toISOString(),
                data: Tour
            }
        );

    } catch (err) {
        console.log(err);
        res.status(404).json(
            {
                status: "internal error", mes: err,
                date: new Date().toISOString(),
            }
        );
    }
};

exports.Tour = async (req, res) => {
    // console.log(req.params.id);
    try {

        const singleTour = await TourModel.findById(req.params.id).populate('reviews');

        res.status(201).json(
            {
                success: "ok", mes: "Tour",
                result: singleTour.length,
                date: new Date().toISOString(),
                data: singleTour
            }
        );

    } catch (err) {
        res.status(404).json(
            {
                status: "fail", mes: "Tour",
                date: new Date().toISOString(),
            }
        );
    }
};

exports.addTour = async (req, res) => {
    try {

        const newTour = await TourModel.create(req.body);
        res.status(201).json(
            {
                success: "ok", mes: "Tour",
                date: new Date().toISOString(),
                data: newTour
            }
        );

    } catch (error) {
        if (err) {
            res.status(404).json(
                {
                    status: "fail", mes: "Tour",
                    date: new Date().toISOString(),
                }
            );
        }
    }



};

exports.updateTour = async (req, res) => {
    try {

        const updatedTour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(201).json(
            {
                success: "ok", mes: "Tour",
                date: new Date().toISOString(),
                data: updatedTour
            }
        );

    } catch (err) {
        if (err) {
            res.status(404).json(
                {
                    status: "fail", mes: err,
                    date: new Date().toISOString(),
                }
            );
        }
    }
};

exports.deleteTour = async (req, res) => {

    try {
        await TourModel.findByIdAndDelete(req.params.id);
        res.status(201).json(
            {
                success: "ok", mes: "Tour",
                date: new Date().toISOString(),

            }
        );

    } catch (err) {
        if (err) {
            res.status(404).json(
                {
                    status: "fail to delete", mes: err,
                    date: new Date().toISOString(),
                }
            );
        }
    }
};

// exports.deleteTour = factory.deleteOne(TourModel)

