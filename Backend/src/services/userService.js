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

module.exports = {
    createUserService,
    loginService,
    getUserService,
    forgotPasswordService,
    resetPasswordService
}