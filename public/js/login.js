import axios from 'axios';
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  console.log("login view function");
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/user/login',
      data: {
        email, password
      }
    });
    // console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'User logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);

    }
  } catch (error) {
    console.log(error);
    showAlert("error", error.response.data.message);

  }
};

export const signUp = async (name, email, password, confirmPassword) => {
  console.log("sign up  view function");
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/user/signUp',
      data: {
        name, email, password, confirmPassword
      }
    });
    // console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'sign up  successfully');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);

    }
  } catch (error) {
    console.log(error);
    showAlert("error", error.response.data.message);

  }
};


export const logout = async () => {

  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/user/logout',
    });
    console.log(res);
    if (res.data.status === 'success') window.location.reload(true);

  } catch (error) {
    console.log(error);
    showAlert("error", error.response.data.message);

  }

};


console.log("first")


