const crypto = require('crypto');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AppError = require('../utils/appError');

const validator = require('validator');
const { Schema } = mongoose;

// const toursData = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
    },
    email: {
        type: String,
        required: [true, 'Email must be provided'],
        unique: true,
        lowercase: true,
        validators: [validator.isEmail, 'plz provided a valid email address']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'plz password password '],
        minLength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'plz password password '],
        validate: {
            // this only works save !!!
            validator: function (value) {
                return value === this.password;
            },
            message: "password is not matches "
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'lead-guide'],
        default: 'user'

    },
    active: {
        type: String,
        default: true,
        select: false
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date

});


userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword); // true
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    // console.log("next middleware");
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, async function (next) {
    this.find({ active: true });
    // this.find({});
    next();
});

userSchema.methods.changePasswordAfter = function (timeStamp) {

    if (this.passwordChangedAt) {
        let changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        console.log({ timeStamp, changeTimeStamp });
        if (timeStamp < changeTimeStamp) {
            //  new AppError("user recently changed password plz login ", 400);
            return timeStamp < changeTimeStamp;
        }
    }
    return false;
};

userSchema.methods.generateResetToken = function () {
    // console.log('generateResetToken');
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;


