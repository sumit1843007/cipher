const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');


exports.deleteOne = Model => {

    return async (req, res, next) => {
        try {
            console.log("deleteOne tour");

            const doc = await Model.findByIdAndDelete(req.params.id);

            if (!doc) {
                return next(new AppError(" error in deleteOne", 403));
            }
            res.status(201).json(
                {
                    success: "ok", mes: "",
                    date: new Date().toISOString(),

                }
            );
        } catch (error) {
            console.log(error);
        }
    };
};

exports.updateOne = Model => {

    return async (req, res, next) => {
        try {
            console.log("updateOne tour");
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });

            if (!doc) {
                return next(new AppError('No document found with that ID', 404));
            }

            res.status(200).json({
                status: 'success',
                data: {
                    data: doc
                }
            });
        } catch (error) {
            res.status(404).json(
                {
                    status: "fail", mes: err,
                    date: new Date().toISOString(),
                }
            );
        }
    };
};

exports.createOne = Model => {
    return async (req, res, next) => {
        try {
            console.log("createOne tour");
            const doc = await Model.create(req.body);
            res.status(201).json(
                {
                    success: "ok", mes: "doc",
                    date: new Date().toISOString(),
                    data: doc
                }
            );

        } catch (error) {
            res.status(404).json(
                {
                    status: "fail", mes: "Tour",
                    date: new Date().toISOString(),
                }
            );
        }
    };
};

exports.getAll = Model => {
    return async (req, res, next) => {
        try {

            console.log(Model);
            const features = new APIFeatures(Model.find(), req.query).filter().sort().paginate().fields();
            const doc = await features.query;
            res.status(201).json(
                {
                    success: "ok", mes: "doc",
                    result: doc.length,
                    date: new Date().toISOString(),
                    data: doc
                }
            );

        } catch (error) {
            console.log(error);
            res.status(404).json(
                {
                    status: "fail", mes: "doc",
                    date: new Date().toISOString(),
                }
            );
        }
    };
};

exports.getOne = (Model, populate) => {
    return async (req, res, next) => {
        try {
            const doc = await Model.findById(req.params.id).populate(populate);

            res.status(201).json(
                {
                    success: "ok", mes: "doc",
                    result: doc.length,
                    date: new Date().toISOString(),
                    data: doc
                }
            );

        } catch (error) {
            console.log(error);
            res.status(404).json(
                {
                    status: "fail", mes: error,
                    date: new Date().toISOString(),
                }
            );
        }
    };
};