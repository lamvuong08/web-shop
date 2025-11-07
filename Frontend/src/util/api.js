import axios from './axios.customize';

// Đăng ký user (tạo tài khoản)
export const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    return axios.post(URL_API, { name, email, password });
};

// Gửi OTP đăng ký
export const sendRegisterOtpApi = (email) => {
    const URL_API = "/v1/api/register/otp";
    return axios.post(URL_API, { email }, { skipAuth: true });
};

// Xác thực OTP & tạo tài khoản
export const verifyRegisterOtpAndCreateUserApi = (payload) => {
    const URL_API = "/v1/api/register/verify";
    // payload gồm: { name, email, password, otp }
    return axios.post(URL_API, payload, { skipAuth: true });
};

// Đăng nhập
export const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    return axios.post(URL_API, { email, password });
};

// Quên mật khẩu
export const forgotPasswordApi = (email) => {
    const URL_API = "/v1/api/forgot-password";
    return axios.post(URL_API, { email }, { skipAuth: true });
};

// Đặt lại mật khẩu
export const resetPasswordApi = async (email, otp, password) => {
    try {
        const URL_API = "/v1/api/reset-password";
        const response = await axios.post(
            URL_API, 
            { email, otp, password },
            { 
                skipAuth: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response) {
            throw new Error('No response from server');
        }

        return response;
    } catch (error) {
        if (error.response?.data) {
            return error.response.data;
        }

        return {
            EC: -1,
            EM: error.message || 'Network error while resetting password'
        };
    }
};

// Lấy danh sách user rút gọn (ví dụ cho profile)
export const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API);
};

// Lấy danh sách tất cả user
export const getAllUsersApi = () => {
    const URL_API = "/v1/api/users";
    return axios.get(URL_API);
};

// Lấy thông tin user theo ID
export const getUserByIdApi = (id) => {
    const URL_API = `/v1/api/users/${id}`;
    return axios.get(URL_API);
};

// Tạo user mới (admin thêm user)
export const createUserCrudApi = (payload) => {
    const URL_API = "/v1/api/users";
    return axios.post(URL_API, payload);
};

// Cập nhật user
export const updateUserApi = (id, updates) => {
    const URL_API = `/v1/api/users/${id}`;
    return axios.put(URL_API, updates);
};

// Xoá user
export const deleteUserApi = (id) => {
    const URL_API = `/v1/api/users/${id}`;
    return axios.delete(URL_API);
};

// Lấy thống kê tổng quan cho dashboard
export const getDashboardStatsApi = () => {
    const URL_API = "/v1/api/dashboard/stats";
    return axios.get(URL_API);
};
