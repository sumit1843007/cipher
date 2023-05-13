const UsersModel = require('../model/user');
const AppError = require('../utils/appError');
const crypto = require('crypto');

const EmailSender = require('./email');

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const generateToken = (id) => {
    return jwt.sign({ id }, 'secret-key', {
        expiresIn: "90d"
    });
};

exports.login = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        const user = await UsersModel.findOne({ email }).select("+password");

        if (!user) {
            return next(new AppError("invalid email.. ", 404));
        }

        const matchPassword = await bcrypt.compare(password, user.password); //true or false

        if (!matchPassword) {
            return next(new AppError("password not match", 404));
        }

        if (!email || !matchPassword) {
            return next(new AppError("email and password are required", 404));
        }

        const token = generateToken(user._id);
        //  jwt.sign({ id: existingUser._id }, 'secret-key');
        res.status(201).json(
            {
                success: "ok", mess: "login successful and token",
                token
            }
        );
    } catch (error) {
        return next(new AppError("error occurred in login "));
    }
};

const sendTokenToUser = async (user, token, res) => {
    const cookiesOptions = {
        httpOnly: true,
    };
    res.cookie("jwt", token, cookiesOptions);
    res.status(201).json(
        {
            success: "success", mes: "User",
            token,
            date: new Date().toISOString(),
            data: user
        }
    );

};

exports.signUp = async (req, res, next) => {
    console.log("sign up called");
    try {
        const user = await UsersModel.create(req.body);
        const token = generateToken(user._id);
        // const token = jwt.sign({ id: user._id }, 'secret-key');

        // password is not visible in output
        user.password = undefined;

        sendTokenToUser(user, token, res);


    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in signUp "));
    }
};

exports.protect = async (req, res, next) => {

    try {
        console.log("protected route  called");

        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            next(new Error('token is missing', 400));
        }

        if (token) {

            const decoded = await promisify(jwt.verify)(token, 'secret-key');
            const freshUsers = await UsersModel.findById(decoded.id);

            // user not found
            if (!freshUsers) {
                next(new Error('user does not exist', 400));
            }

            // check if the user changed their password after the token was issued
            if (freshUsers.changePasswordAfter(decoded.iat)) {
                next(new AppError("user recently changed password plz login ", 400));
            };
            req.user = freshUsers;
        }
        //grant the user of protected route
        next();

    } catch (error) {
        next(new Error('Failed to authenticate token.', 400));
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role);
        if (!roles.includes(req.user.role)) {
            return next(new AppError("you don't have to permits this route ", 403));
        }
        next();
    };
};

exports.forgetPassword = async (req, res, next) => {
    try {
        const user = await UsersModel.findOne({ email: req.body.email });
        // console.log(user);

        if (!user) {
            return next(new AppError("this email does not exist ", 404));
        }

        //generated random token
        const token = user.generateResetToken();
        console.log(token);
        await user.save({ validateBeforeSave: false });

        const Url = `${req.protocol}://${req.get('host')}/api/v1/users/${token}`;
        console.log({ Url });

        const messages = `your url ${Url}`;

        try {
            let tem = await EmailSender({
                email: req.body.email,
                subject: `your token is valid for 10 min`,
                messages
            });
            console.log(tem);
            res.status(201).json(
                {
                    success: "success", mes: "token sent successfully",
                    token,
                    Url
                }
            );
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpire = undefined;
            await user.save({ validateBeforeSave: false });
            // console.log(error);
            return next(new Error("email not sent. Please try again", 500));
        }

    } catch (error) {
        return next(new Error("error occurred in forget password", 500));

    }

};

exports.resetPassword = async (req, res, next) => {
    try {
        console.log("token", req.params.token);

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        console.log({ hashedToken });

        const user = await UsersModel.findOne(
            {
                passwordResetToken: hashedToken,
                passwordResetExpire: { $gt: Date.now() }
            }
        );
        console.log(user);

        if (!user) {
            return next(new AppError("token was expired"));
        }

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;

        await user.save();


        const token = generateToken(user._id);

        res.status(201).json(
            {
                success: "ok", mess: "passwords reset successfully",
                token
            }
        );
    } catch (error) {
        return next(new AppError("error occurred in reset Password", 500));

    }

};

exports.updatePassword = async (req, res, next) => {

    try {
        const user = await UsersModel.findById(req.user.id).select("+password");

        const matchPassword = await bcrypt.compare(req.body.oldPassword, user.password); //true or false

        if (!matchPassword) {
            // res.status(400).json({ message: "oldPassword is not correct" });
            return next(new AppError("oldPassword is not correct", 400));
        }

        user.password = req.body.newPassword; 2;
        user.confirmPassword = req.body.newPassword;

        const token = generateToken(user._id);

        return res.status(201).json(
            {
                success: "ok", mess: "password update successful and token",
                token
            }
        );
    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in updatePassword", 500));
    }


};

