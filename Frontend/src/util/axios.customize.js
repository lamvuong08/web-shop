import axios from 'axios';

// const config = { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } };
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
});

// Add a defaults after instance
instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem("access_token")}`;

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lies within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error?.response?.data) return error.response.data;
    return Promise.reject(error);
});

export default instance;