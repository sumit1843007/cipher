const nodemailer = require('nodemailer');

const SendEmail = async (option) => {
    const transporter = await nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'norwood.dietrich@ethereal.email',
            pass: 'rzXXmaGG7s84rteGmJ'
        }
    });


    const mailOption = {
        from: 'test@gmail.com',
        to: option.email,
        subject: option.subject,
        // html: "<h2>Hi! There</h2> <h5> This HTML content is "
    };

    let token = await transporter.sendMail(mailOption);
    return token;
};

module.exports = SendEmail;