let stripe = Stripe('pk_test_51NBvFhSDNnF4fdWajXUsT3wq0LZZTfA4QdptxusHwGesKnUfXjlIvOwSSgUBUIXabiJNa1lO1wmX5hez7F3lwYtY00xihjYVUN');
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API
        const session = await axios(`http://localhost:8000/api/bookings/check-out/${tourId}`); // call 
        console.log(session);

        // 2) Create checkout form + chanre credit card
        // on click pay
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
