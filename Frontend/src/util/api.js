import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    };
    return axios.post(URL_API, data)
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    };
    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}

export {
    createUserApi, loginApi, getUserApi
}

export const forgotPasswordApi = (email) => {
    const URL_API = "/v1/api/forgot-password";
    return axios.post(URL_API, { email });
}

export const resetPasswordApi = (email, otp, password) => {
    const URL_API = "/v1/api/reset-password";
    return axios.post(URL_API, { email, otp, password });
}