const UsersModel = require('../model/user');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const Email = require('../utils/email');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const generateToken = (id) => {
    return jwt.sign({ id }, 'secret-key', {
        expiresIn: "90d"
    });
};

exports.login = async (req, res, next) => {
    console.log("login .....");
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
        sendTokenToUser(user, token, res);

    } catch (error) {
        console.log(error);
        return next(new Error("error occurred in login", 400));
    }
};

exports.logout = async (req, res, next) => {
    console.log("In logout");
    try {
        const cookiesOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 10 * 1000)
        };
        res.cookie("jwt", "Logged-out", cookiesOptions);
        res.status(201).json(
            {
                status: "success"
            }
        );
    } catch (error) {
        return next(new Error("error occurred in logout", 400));

    }
};

const sendTokenToUser = async (user, token, res) => {
    const cookiesOptions = {
        httpOnly: true,
    };
    res.cookie("jwt", token, cookiesOptions);
    res.status(201).json(
        {
            status: "success", mes: "User",
            token,
            date: new Date().toISOString(),
            data: user
        }
    );

};

exports.signUp = async (req, res, next) => {
    console.log("sign up called");
    try {
        const user = await UsersModel.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        });
        // const Url = `${req.protocol}://${req.get('host')}/account`;
        const Url = `http://localhost:8000/account`;


        await new Email(user, Url).sendWelcome();
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


// only for required pages ,no error 
exports.isLogin = async (req, res, next) => {
    console.log("is login ...");
    if (req.cookies.jwt) {
        // console.log("is logged in");
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, 'secret-key');
            const freshUsers = await UsersModel.findById(decoded.id);

            // user not found
            if (!freshUsers) {
                return next();
            }

            // check if the user changed their password after the token was issued
            if (freshUsers.changePasswordAfter(decoded.iat)) {
                return next();
            };

            //there logged in users 
            res.locals.user = freshUsers;
            return next();


        } catch (error) {
            return next();

        }

    };
    next(); // reached to overview page when logout ( fail to verify token )
};

exports.protect = async (req, res, next) => {

    try {
        console.log("protected route  called");
        // console.log(req.cookies.jwt);
        let token;
        let freshUsers;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            return next(new AppError(' You are not logged in! Please log in to get access. (token is missing)', 400));
        }

        if (token) {

            const decoded = await promisify(jwt.verify)(token, 'secret-key');
            freshUsers = await UsersModel.findById(decoded.id);

            // user not found
            if (!freshUsers) {
                return next(new Error('user does not exist', 400));
            }

            // check if the user changed their password after the token was issued
            if (freshUsers.changePasswordAfter(decoded.iat)) {
                return next(new AppError("user recently changed password plz login ", 400));
            };

        }

        //grant the user of protected route
        req.user = freshUsers;
        res.locals.user = freshUsers;
        next();


    } catch (error) {
        return next(new AppError('Failed to authenticate token.', 400));
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

        if (!user) {
            return next(new AppError("this email does not exist ", 404));
        }

        //generated random token
        const token = user.generateResetToken();
        // console.log(token);
        await user.save({ validateBeforeSave: false });

        const Url = `${req.protocol}://${req.get('host')}/api/v1/users/${token}`;

        const messages = `your url ${Url}`;

        try {

            await new Email(user, Url).sendPasswordReset();

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
        console.log(user);

        const matchPassword = await bcrypt.compare(req.body.currentPassword, user.password); //true or false


        // 2) Check if POSTed current password is correct
        if (!matchPassword) {
            return next(new AppError('Your current password is wrong.', 401));
        }

        // 3) If so, update password
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            data: {
                user: user,
                token
            }
        });
    } catch (error) {
        console.log(error);
        return next(new AppError("error occurred in updatePassword", 500));
    }

};

