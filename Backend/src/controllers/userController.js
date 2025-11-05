const { createUserService, loginService, getUserService, forgotPasswordService, resetPasswordService } = require('../services/userService');

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

module.exports = {
    createUser, handleLogin, getUser, getAccount, forgotPassword, resetPassword
}