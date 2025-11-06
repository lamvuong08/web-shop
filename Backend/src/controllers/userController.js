const { 
    createUserService, 
    loginService, 
    getUserService, 
    forgotPasswordService, 
    resetPasswordService,
    sendRegisterOtpService,
    verifyRegisterOtpService
} = require('../services/userService');

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data)
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);

    return res.status(200).json(data)
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data)
}

const getAccount = async (req, res) => {
    return res.status(200).json(req.user)
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const data = await forgotPasswordService(email);
    if (!data) return res.status(200).json({ EC: 1, EM: 'Email không tồn tại' });
    return res.status(200).json({ EC: 0 });
}

const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    const data = await resetPasswordService(email, otp, password);
    return res.status(200).json(data);
}

const sendRegisterOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ EC: 1, EM: 'Email is required' });
    }
    const result = await sendRegisterOtpService(email);
    return res.status(200).json(result);
};

const verifyRegisterOtp = async (req, res) => {
    const payload = req.body;
    if (!payload.email || !payload.otp) {
        return res.status(400).json({ EC: 1, EM: 'Email and OTP are required' });
    }
    const result = await verifyRegisterOtpService(payload);
    return res.status(200).json(result);
};

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    forgotPassword,
    resetPassword,
    sendRegisterOtp,
    verifyRegisterOtp
}