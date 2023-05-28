import '@babel/polyfill';
import { login, logout, signUp } from "./login";
import { updateSetting } from "./updateSetting";
import { bookTour } from "./stripe";

// DOM elements
const loginForm = document.querySelector("#form");
const logoutBtn = document.querySelector(".nav__el--logout");
const updateSting = document.querySelector(".form-user-data");
const updatePassword = document.querySelector("#savePassword");
const bookBtn = document.querySelector('#book-tour');
const signUpForm = document.querySelector('#form1');

console.log(bookBtn);

if (loginForm) {
    console.log({ email, password });
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        login(email, password);
    });
}

if (signUpForm) {

    signUpForm.addEventListener('submit', (e) => {
        console.log("signUp viewed");
        e.preventDefault();
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirmPassword').value;
        console.log({ name, email, password, confirmPassword });
        signUp(name, email, password, confirmPassword);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (updateSting) {
    updateSting.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('#saveSetting').textContent = 'Updating...';

        const form = new FormData();
        form.append('name', document.querySelector('#name').value);
        form.append('email', document.querySelector('#email').value);
        form.append('photo', document.querySelector('#photo').files[0]);

        console.log(form);

        await updateSetting(form, 'data');
        document.querySelector('#saveSetting').textContent = 'Save settings';

    });
}
if (updatePassword) {
    updatePassword.addEventListener('click', async (e) => {
        console.log("updatePassword");
        e.preventDefault();

        document.querySelector('#savePassword').textContent = 'Updating...';

        const currentPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;

        await updateSetting({ currentPassword, password, confirmPassword }, 'password');
        document.querySelector('#savePassword').textContent = 'Save password';


        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

    });
}

if (bookBtn) {
    console.log("bookBtn clicked");
    bookBtn.addEventListener('click', async (e) => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        console.log(tourId);
        bookTour(tourId);

    });
}

console.log("first hello world");