const { 
    createUserService, 
    loginService, 
    getUserService, 
    forgotPasswordService, 
    resetPasswordService,
    sendRegisterOtpService,
    verifyRegisterOtpService
} = require('../services/userService');
const User = require('../models/user');
const { sendMail } = require('../utils/mailer');

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
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(200).json({
        EC: 1,
        EM: 'Email không tồn tại trong hệ thống'
      });
    }

    // Tạo mã OTP (6 chữ số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Thời gian hết hạn OTP (5 phút)
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 5);

    // Lưu OTP và thời gian hết hạn vào database
    await user.update({
      otpCode: otp,
      otpExpires: otpExpires
    });

    // Chuẩn bị nội dung email
    const subject = 'Mã OTP đặt lại mật khẩu';
    const html = `
      <h2>Xin chào ${user.name},</h2>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
      <p>Mã OTP của bạn là: <strong style="font-size: 20px; color: #1677ff;">${otp}</strong></p>
      <p>Mã này sẽ hết hạn sau 5 phút.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      <br>
      <p>Trân trọng,</p>
      <p>Web Shop Team</p>
    `;

    // Gửi email
    try {
      await sendMail(email, subject, html);
    } catch (emailError) {
      console.error('Lỗi gửi email:', emailError);
      return res.status(200).json({
        EC: 2,
        EM: 'Không thể gửi mã OTP qua email. Vui lòng thử lại sau.'
      });
    }

    return res.status(200).json({
      EC: 0,
      EM: 'Mã OTP đã được gửi đến email của bạn'
    });

  } catch (error) {
    console.error("Lỗi xử lý forgot password:", error);
    return res.status(500).json({
      EC: -1,
      EM: 'Lỗi server khi xử lý yêu cầu'
    });
  }
};


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

const handleListUsers = async (req, res) => {
    try {
        const result = await listUsers();
        return res.status(200).json(result);
    } catch (error) {
        console.error('handleListUsers error:', error);
        return res.status(500).json({ EC: 1, EM: 'Lỗi server khi lấy danh sách user' });
    }
};

const handleGetUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ EC: 1, EM: 'Thiếu ID user' });

        const result = await getUserById(id);
        return res.status(200).json(result);
    } catch (error) {
        console.error('handleGetUserById error:', error);
        return res.status(500).json({ EC: 2, EM: 'Lỗi server khi lấy user' });
    }
};

const handleCreateUser = async (req, res) => {
    try {
        const payload = req.body;
        const result = await createUserCrud(payload);
        return res.status(200).json(result);
    } catch (error) {
        console.error('handleCreateUser error:', error);
        return res.status(500).json({ EC: 3, EM: 'Lỗi server khi tạo user' });
    }
};

const handleUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ EC: 1, EM: 'Thiếu ID user để cập nhật' });

        const updates = req.body;
        const result = await updateUser(id, updates);
        return res.status(200).json(result);
    } catch (error) {
        console.error('handleUpdateUser error:', error);
        return res.status(500).json({ EC: 2, EM: 'Lỗi server khi cập nhật user' });
    }
};

const handleDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ EC: 1, EM: 'Thiếu ID user để xoá' });

        const result = await deleteUser(id);
        return res.status(200).json(result);
    } catch (error) {
        console.error('handleDeleteUser error:', error);
        return res.status(500).json({ EC: 2, EM: 'Lỗi server khi xoá user' });
    }
};

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    forgotPassword,
    resetPassword,
    sendRegisterOtp,
    verifyRegisterOtp,

    handleListUsers,
    handleGetUserById,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
}