const dotenv = require('dotenv');
// require('dotenv').config();
dotenv.config({ path: './config.env' });

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const toursRouters = require("./routes/tour");
const usersRouters = require("./routes/user");
const reviewRouters = require("./routes/review");
const express = require('express');

const mongoose = require('mongoose');



const app = express();

const DB = process.env.URL.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => {
    console.log(" db connection established");
}).catch(err => {
    console.log(err);
});

app.use(express.json());

app.use('/api/tours', toursRouters);
app.use('/api/user', usersRouters);
app.use('/api/reviews', reviewRouters);


app.get('*', (err, req, res, next) => {
    // console.log('not found');

    // const err = new AppError("path not found");
    // err.status = 'fail';
    // err.statusCode = 404;

    console.log(err);

    next(new AppError("path not found", 404));
});


app.use(globalErrorHandler);

const PORT = 8000;

app.listen(PORT, () => {
    console.log("listening at port 8000");
});



