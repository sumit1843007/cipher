const UsersModel = require('../model/user');
const AppError = require('../utils/appError');

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
    try {
        if (req.body.password || req.body.confirmPassword) {
            console.log('called');
            return next(new AppError('this is not a valid route to update password', 400));
        }

        // filtered out unwanted fields name that are not allowed to be updated
        const filteredBody = filteredObj(req.body, 'name', 'email');

        // update the users documents
        const updateUser = await UsersModel.findByIdAndUpdate(
            req.user.id, filteredBody,
            { new: true }, { runValidators: true }
        );

        return res.status(201).json(
            {
                success: "ok", mess: "success ",
                data: {
                    user: updateUser

                }
            }
        );

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
}



