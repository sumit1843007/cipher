const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User!']
    },
    price: {
        type: Number,
        require: [true, 'Booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate('user');
    next();
});


const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
