// const AppError = require('../utils/appError');

// const catchAsync = require('./catchAsync');
// exports.deleteOne = Model => {
//     async (req, res, next) => {

//         try {
//             const doc = await Model.findByIdAndDelete(req.params.id);
//             res.status(201).json(
//                 {
//                     success: "ok", mes: "doc",
//                     date: new Date().toISOString(),
//                 }
//             );
//             if (!doc) {
//                 return next(new AppError(" document is not find", 403));

//             }

//         } catch (err) {
//             // if (err) {
//             //     res.status(404).json(
//             //         {
//             //             status: "fail to delete", mes: err,
//             //             date: new Date().toISOString(),
//             //         }
//             //     );
//             // }
//             return next(new AppError(" error in reviews", 403));

//         }
//     };
// };