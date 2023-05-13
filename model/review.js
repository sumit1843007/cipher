const mongoose = require('mongoose');
const { Schema } = mongoose;

// const toursData = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));
const reviewSchema = new Schema({
    review: {
        type: String,
        trim: true,
        required: [true, 'A review cannot be empty']

    },
    photo: String,
    rating: {
        type: Number,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        // select: false
    },

    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, 'Review must be belong to this tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, 'Review must be belong to this user']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }

);

reviewSchema.pre(/^find/, async function (next) {

    // this.populate({
    //     path: 'tour',
    //     select: 'name photo'
    // }).populate({
    //     path: 'user',
    //     select: 'name'
    // });

    this.populate({
        path: 'user',
        select: 'name'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


