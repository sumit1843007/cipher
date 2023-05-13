class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // console.log(typeof (`${statusCode}`));
        this.status = `${statusCode}`.startsWith('4') ? "failed" : "error";
    }
}

module.exports = AppError;