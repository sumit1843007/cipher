const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const fs = require('fs');
const tourSchema = require('./model/tour');
const userSchema = require('./model/user');
const reviewSchema = require('./model/review');
const mongoose = require('mongoose');

const toursData = JSON.parse(fs.readFileSync(`./data/tour.json`));
const userData = JSON.parse(fs.readFileSync(`./data/user_data.json`));
const reviewData = JSON.parse(fs.readFileSync(`./data/reviews.json`));

const DB = process.env.URL.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => {
    console.log(" db connection established");
}).catch(err => {
    console.log(err);
});


const importData = async () => {
    try {
        await tourSchema.create(toursData);
        await userSchema.create(userData, { validateBeforeSave: false });
        await reviewSchema.create(reviewData);

        console.log("added data to db");
    } catch (error) {
        if (error) {
            console.log(error);
            console.log("failed to add data to db");
        }
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await tourSchema.deleteMany();
        await userSchema.deleteMany();
        console.log("delete data to db");
    } catch (error) {
        if (error) {
            console.log("failed to delete data to db");
        }
    }
    process.exit();
};


if (process.argv[2] === '--import') {
    importData();
}
if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);
