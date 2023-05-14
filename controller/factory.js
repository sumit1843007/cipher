const AppError = require('../utils/appError');

// const catchAsync = require('./catchAsync');
exports.deleteOne = Model => {
    async (req, res, next) => {

        try {
            const doc = await Model.findByIdAndDelete(req.params.id);

            if (!doc) {
                return next(new AppError(" error in reviews", 403));
            }
            res.status(201).json(
                {
                    success: "ok", mes: "",
                    date: new Date().toISOString(),

                }
            );

        } catch (err) {
            return next(new AppError(" error in reviews", 403));

        }
    };
};