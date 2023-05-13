module.exports = (err, req, res, next) => {
    err.status = err.status || 'fail';
    err.statusCode = err.statusCode || 400;

    res.status(err.statusCode).json(
        { status: err.status, message: err.message }
    );

};