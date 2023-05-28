import axios from 'axios';
import { showAlert } from "./alerts";

export const updateSetting = async (data, type) => {
    try {

        const url = type === 'password' ? 'http://localhost:8000/api/user/updatePassword' : 'http://localhost:8000/api/user/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        // in browser
        console.log(res);
        console.log('updateSetting');

        if (res.data.status === 'success') {
            showAlert('success', `${type} User update  successfully`);
        }
    } catch (error) {
        console.log(error);
        showAlert("error", error.response.data.message);

    }
};