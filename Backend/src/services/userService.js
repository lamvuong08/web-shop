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
            role: 'pending'
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
    console.log('>>> [verifyRegisterOtpService] START with payload:', payload);

    try {
        const { email, otp, firstName, lastName, password, phone, role } = payload;
        console.log('>>> [verifyRegisterOtpService] Extracted fields:', { email, otp, firstName, lastName, phone, role });

        // 1️⃣ Find temporary user
        console.log('>>> [verifyRegisterOtpService] Looking for temp user with email + otp...');
        const tempUser = await User.findOne({ 
            where: { email, otpCode: otp } 
        });
        console.log('>>> [verifyRegisterOtpService] tempUser found:', !!tempUser);

        if (!tempUser) {
            console.warn('⚠️ [verifyRegisterOtpService] OTP không hợp lệ cho email:', email);
            return { EC: 1, EM: 'OTP không hợp lệ' };
        }

        // 2️⃣ Check OTP expiry
        console.log('>>> [verifyRegisterOtpService] Checking OTP expiry...');
        if (!tempUser.otpExpires) {
            console.warn('⚠️ [verifyRegisterOtpService] otpExpires missing for user:', tempUser.id);
            return { EC: 2, EM: 'OTP đã hết hạn' };
        }

        console.log('>>> [verifyRegisterOtpService] otpExpires =', tempUser.otpExpires.toLocaleString());
        if (tempUser.otpExpires.getTime() < Date.now()) {
            console.warn('⚠️ [verifyRegisterOtpService] OTP expired for email:', email);
            return { EC: 2, EM: 'OTP đã hết hạn' };
        }

        // 3️⃣ Update user info
        const name = `${lastName ?? ''} ${firstName ?? ''}`.trim();
        console.log('>>> [verifyRegisterOtpService] Updating user info. Final name:', name);

        const hashPassword = await bcrypt.hash(password, saltRounds);
        console.log('>>> [verifyRegisterOtpService] Password hashed successfully');

        await tempUser.update({
            name,
            password: hashPassword,
            phone,
            role: role || 'User',
            otpCode: null,
            otpExpires: null
        });
        console.log('>>> [verifyRegisterOtpService] User updated successfully (ID:', tempUser.id, ')');

        // 4️⃣ Generate access token
        const payloadToken = {
            email: tempUser.email,
            name
        };
        console.log('>>> [verifyRegisterOtpService] Creating JWT with payload:', payloadToken);

        const access_token = jwt.sign(payloadToken, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRE 
        });
        console.log('>>> [verifyRegisterOtpService] JWT generated successfully');

        // 5️⃣ Return success
        console.log('✅ [verifyRegisterOtpService] Registration verified successfully');
        return { 
            EC: 0, 
            EM: 'Đăng ký thành công',
            access_token,
            user: {
                id: tempUser.id,
                name,
                email: tempUser.email,
                role: tempUser.role
            }
        };

    } catch (error) {
        console.error('❌ [verifyRegisterOtpService] ERROR:', error);
        if (error?.stack) console.error('>>> Stack trace:', error.stack);
        return { EC: 3, EM: 'Lỗi hệ thống', DT: error.message };
    } finally {
        console.log('>>> [verifyRegisterOtpService] END\n');
    }
};


module.exports = {
    createUserService,
    loginService,
    getUserService,
    forgotPasswordService,
    resetPasswordService,
    sendRegisterOtpService,
    verifyRegisterOtpService
}