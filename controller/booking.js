const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const TourModel = require('../model/tour');
const UserModel = require('../model/user');
const BookingModel = require('../model/booking');
const factory = require('./factory');

exports.getCheckoutSession = async (req, res, next) => {
    try {

        // 1) Get the currently booked tour
        const tour = await TourModel.findById(req.params.tourId);

        // 2) Create checkout session
        const session = await stripe.checkout.sessions.create({
            // payment_method_types: ['card'],

            customer_email: req.user.email,
            client_reference_id: req.params.tourId,

            line_items: [
                {
                    price_data: {
                        currency: 'INR',
                        unit_amount: tour.price * 100,
                        product_data: {
                            name: tour.name,
                            description: tour.description,
                            images: [
                                `http://localhost:8000/img/tours/${tour.imageCover}`
                            ],
                        },
                    },
                    quantity: 1,
                }
            ],
            mode: 'payment',
            // success_url: `${req.protocol}://${req.get('host')}/`,
            cancel_url: `${req.protocol}://${req.get('host')}/`,
            success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`
        });

        // 3) Create session as response
        res.status(200).json({
            status: 'success',
            session
        });
    } catch (error) {
        console.log({ error });
    }
};


//save booking information into database
// const createBookingCheckout = async session => {
//     try {
//         const tour = session.client_reference_id;
//         const user = (await UserModel.findOne({ email: session.customer_email })).id;
//         const price = session.display_items[0].amount / 100;
//         await BookingModel.create({ tour, user, price });
//     } catch (error) {
//         console.log(error);
//     }
// };
exports.createBookingCheckout = async (req, res, next) => {
    try {
        console.log('createBookingCheckout called');
        // console.log(req.query);
        const { tour, user, price, } = req.query;
        if (!user && !tour && !price) return next();

        await BookingModel.create({ tour, user, price });
        res.redirect(req.originalUrl.split('?')[0]);

    } catch (error) {
        console.log(error);
    }
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed')
        createBookingCheckout(event.data.object);

    res.status(200).json({ received: true });
};

exports.getAllBooking = factory.getAll(BookingModel);

