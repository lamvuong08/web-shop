require('dotenv').config();

const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        //check user exist
        const user = await User.findOne({ where: { email } });
        if (user) {
            console.log('>> user exist, chọn email khác: ${email}');
            return null;
        }

        //hash user password
        const hashPassword = await bcrypt.hash(password, saltRounds);

        //save user to database
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "User"
        });
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const loginService = async (email, password) => {
    try {
        //fetch user by email
        const user = await User.findOne({ where: { email: email } });
        if (user) {
            //compare password
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password không hợp lệ"
                }
            } else {
                //create an access token
                const payload = {
                    email: user.email,
                    name: user.name
                }
                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                );
                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                }
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            }
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserService = async () => {
    try {
        let result = await User.findAll({ attributes: { exclude: ['password'] } });
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const forgotPasswordService = async (email) => {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return null;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otpCode = otp;
        user.otpExpires = expires;
        await user.save();

        const subject = 'Mã OTP đặt lại mật khẩu';
        const html = `<p>Xin chào ${user.name},</p>
<p>Mã OTP của bạn là: <b>${otp}</b></p>
<p>Mã có hiệu lực đến: ${expires.toLocaleString()}</p>`;
        await sendMail(user.email, subject, html);

        return { EC: 0 };
    } catch (error) {
        console.log(error);
        return { EC: 1, EM: 'Không thể gửi OTP' };
    }
}

const resetPasswordService = async (email, otp, newPassword) => {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !user.otpCode) {
            return { EC: 1, EM: 'OTP không hợp lệ' };
        }
        if (user.otpCode !== otp) {
            return { EC: 1, EM: 'OTP không đúng' };
        }
        if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
            return { EC: 2, EM: 'OTP đã hết hạn' };
        }

        const hashPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashPassword;
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        return { EC: 0 };
    } catch (error) {
        console.log(error);
        return { EC: 3, EM: 'Có lỗi xảy ra' };
    }
}

const sendRegisterOtpService = async (email) => {
    try {
        // Check if email exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return { EC: 1, EM: 'Email đã được sử dụng' };
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create temporary user record with OTP
        const tempUser = await User.create({
            email,
            otpCode: otp,
            otpExpires: expires,
            // Set temporary values for required fields
            name: 'Temporary',
            password: 'temporary',
            isVerify: false
        });

        // Send OTP email
        const subject = 'Mã OTP đăng ký tài khoản';
        const html = `
            <p>Xin chào,</p>
            <p>Mã OTP của bạn là: <b>${otp}</b></p>
            <p>Mã có hiệu lực đến: ${expires.toLocaleString()}</p>
            <p>Vui lòng không chia sẻ mã này với người khác.</p>
        `;

        const mailResult = await sendMail(email, subject, html);
        if (!mailResult || mailResult.EC === 1) {
            // If mail fails, delete the temporary user
            await tempUser.destroy();
            return { EC: 2, EM: 'Không thể gửi email OTP' };
        }

        return { EC: 0, EM: 'Đã gửi mã OTP' };
    } catch (error) {
        console.error('sendRegisterOtpService error:', error);
        return { EC: 3, EM: 'Lỗi hệ thống' };
    }
};

const verifyRegisterOtpService = async (payload) => {
    try {
        const { email, otp, firstName, lastName, password, phone, role } = payload;
        
        // Find temporary user with OTP
        const tempUser = await User.findOne({ 
            where: { 
                email,
                otpCode: otp
            } 
        });

        if (!tempUser) {
            return { EC: 1, EM: 'OTP không hợp lệ' };
        }

        if (!tempUser.otpExpires || tempUser.otpExpires.getTime() < Date.now()) {
            return { EC: 2, EM: 'OTP đã hết hạn' };
        }

        // Update user with actual information
        const name = `${lastName ?? ''} ${firstName ?? ''}`.trim();
        const hashPassword = await bcrypt.hash(password, saltRounds);

        await tempUser.update({
            name,
            password: hashPassword,
            phone,
            role: role || 'User',
            otpCode: null,
            otpExpires: null
        });

        // Create access token so frontend can optionally auto-login
        const payloadToken = {
            email: tempUser.email,
            name
        };
        const access_token = jwt.sign(payloadToken, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        return { 
            EC: 0, 
            EM: 'Đăng ký thành công',
            access_token,
            user: {
                id: tempUser.id,
                name: name,
                email: tempUser.email,
                role: tempUser.role
            }
        };
    } catch (error) {
        console.error('verifyRegisterOtpService error:', error);
        return { EC: 3, EM: 'Lỗi hệ thống' };
    }
};

// Lấy DS tất cả người dùng
const listUsers = async (options = {}) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            ...options
        });
        return { EC: 0, EM: 'Lấy danh sách user thành công', data: users };
    } catch (error) {
        console.error('getAllUsersService error:', error);
        return { EC: 1, EM: 'Lỗi hệ thống khi lấy danh sách user' };
    }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (id) => {
    try {
        const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
        if (!user) return { EC: 1, EM: 'Không tìm thấy user' };
        return { EC: 0, EM: 'Lấy thông tin user thành công', data: user };
    } catch (error) {
        console.error('getUserByIdService error:', error);
        return { EC: 2, EM: 'Lỗi hệ thống khi lấy user' };
    }
};

// Tạo người dùng mới
const createUser = async (payload) => {
    try {
        const { name, email, password, role } = payload;

        // Kiểm tra các trường bắt buộc
        if (!name || !email || !password) {
            return { EC: 1, EM: 'Thiếu thông tin bắt buộc (name, email, password)' };
        }

        // Kiểm tra email trùng
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return { EC: 2, EM: 'Email đã tồn tại' };
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // Tạo user
        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            role: role && ['customer', 'admin'].includes(role) ? role : 'customer'
        });

        // Ẩn password khi trả về
        const { password: _, ...userData } = newUser.toJSON();

        return { EC: 0, EM: 'Tạo user thành công', data: userData };
    } catch (error) {
        console.error('createUserCrudService error:', error);
        return { EC: 3, EM: 'Lỗi hệ thống khi tạo user' };
    }
};

// Cập nhật thông tin user
const updateUser = async (id, updates) => {
    try {
        const user = await User.findByPk(id);
        if (!user) return { EC: 1, EM: 'Không tìm thấy user' };

        // Không cho phép cập nhật email hoặc password trực tiếp qua API này
        const allowedFields = ['name', 'role', 'phone'];
        const updateData = {};

        for (const key of allowedFields) {
            if (updates[key] !== undefined) updateData[key] = updates[key];
        }

        await user.update(updateData);
        return { EC: 0, EM: 'Cập nhật user thành công', data: user };
    } catch (error) {
        console.error('updateUserService error:', error);
        return { EC: 2, EM: 'Lỗi hệ thống khi cập nhật user' };
    }
};

//  Xoá người dùng
const deleteUser = async (id) => {
    try {
        const user = await User.findByPk(id);
        if (!user) return { EC: 1, EM: 'Không tìm thấy user để xoá' };

        await user.destroy();
        return { EC: 0, EM: 'Xoá user thành công' };
    } catch (error) {
        console.error('deleteUserService error:', error);
        return { EC: 2, EM: 'Lỗi hệ thống khi xoá user' };
    }
};

module.exports = {
    createUserService,
    loginService,
    getUserService,
    forgotPasswordService,
    resetPasswordService,
    sendRegisterOtpService,
    verifyRegisterOtpService,
    
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}