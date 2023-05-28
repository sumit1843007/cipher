const dotenv = require('dotenv');
// require('dotenv').config();
dotenv.config({ path: './config.env' });

const cookieParser = require('cookie-parser');



const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const toursRouters = require("./routes/tour");
const usersRouters = require("./routes/user");
const reviewRouters = require("./routes/review");
const viewRouters = require("./routes/viewRouter");
const bookings = require("./routes/booking");
const express = require('express');
const path = require('path');
const compression = require('compression');

const mongoose = require('mongoose');

const app = express();

const DB = process.env.URL.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => {
    console.log(" db connection established");
}).catch(err => {
    console.log(err);
});

app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



app.use('/', viewRouters);

app.use('/api/tours', toursRouters);
app.use('/api/user', usersRouters);
app.use('/api/reviews', reviewRouters);
app.use('/api/bookings', bookings);


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



