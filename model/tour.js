const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');


// const toursData = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));

const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,

    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],

    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,

    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
// tourSchema.pre(/^find/, function (next) {
//     this.find({ secretTour: false });

//     // this.start = Date.now();
//     next();
// });




//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// tourSchema.pre(/^find/, async function (next) {

//     this.populate({
//         path: 'guides',
//         select: 'name photo'
//     });

//     next();
// });

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});



const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;


