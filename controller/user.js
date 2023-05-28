const multer = require('multer');
const sharp = require('sharp');
const UsersModel = require('../model/user');
const AppError = require('../utils/appError');
const factory = require('./factory');


// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });


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

exports.uploadUserPhoto = upload.single('photo');

// ---------------------- img end --------------------


exports.resizeUserPhoto = async (req, res, next) => {
    try {
        if (!req.file) return next();

        req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/users/${req.file.filename}`); //write the file into disk

        next(); //reached to update me
    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in resizeUserPhoto", 500));
    }
};

const filteredObj = (obj, ...allowed) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowed.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    console.log(newObj);
    return newObj;
};

exports.users = async (req, res) => {

    const body = (req.body);
    console.log(body);
    try {
        const Users = await UsersModel.find();
        res.status(201).json(
            {
                success: "ok", mes: "User",
                length: Users.length,

                date: new Date().toISOString(),
                data: Users
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


exports.updateMe = async (req, res, next) => {
    console.log("updateMe");
    // console.log(req.body);
    console.log(req.file);
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.confirmPassword) {
            return next(new AppError('this is not a valid route to update password', 400));
        }

        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const filteredBody = filteredObj(req.body, 'name', 'email');
        if (req.file) filteredBody.photo = req.file.filename;
        console.log(filteredBody);


        // 3) Update user document
        const updatedUser = await UsersModel.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in updateMe", 500));
    }
};

exports.deleteMe = async (req, res, next) => {

    try {
        const User = await UsersModel.findByIdAndUpdate(
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
};

exports.getMe = async (req, res, next) => {

    req.params.id = req.user.id;

    try {
        const User = await UsersModel.findById(req.params.id);

        res.status(201).json(
            {
                success: "ok", mess: "Single user",
                data: {
                    User

                }
            }
        );

    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in deleteMe", 500));
    }
};

exports.users = factory.getAll(UsersModel)

