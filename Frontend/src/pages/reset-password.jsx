import React, { useEffect } from 'react';
import { Button, Form, Input, notification,message } from 'antd';
import { resetPasswordApi } from '../util/api';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LockOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import '../styles/reset-password.css';

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const email = location?.state?.email;
    const fromForgotPassword = location?.state?.fromForgotPassword;
    
    if (email) {
      form.setFieldsValue({ email });
    }
    
    // Nếu người dùng truy cập trực tiếp vào trang này mà không qua forgot password
    if (!fromForgotPassword) {
      notification.warning({
        message: 'Truy cập không hợp lệ',
        description: 'Vui lòng thực hiện quên mật khẩu trước khi đặt lại mật khẩu.',
        duration: 5
      });
      navigate('/forgot-password');
    }
  }, [location, form, navigate]);

  const validateOtp = (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập mã OTP');
    }
    if (!/^\d{6}$/.test(value)) {
      return Promise.reject('Mã OTP phải là 6 chữ số');
    }
    return Promise.resolve();
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập mật khẩu mới');
    }
    if (value.length < 6) {
      return Promise.reject('Mật khẩu phải có ít nhất 6 ký tự');
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject('Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số');
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    const { email, otp, password } = values;
    try {
      // Hiển thị loading
      const key = 'resetPassword';
      message.loading({ 
        content: 'Đang xử lý yêu cầu...', 
        key, 
        duration: 0 
      });

      // Debug log
      console.log('🔄 Sending reset password request for:', email);

      const res = await resetPasswordApi(email, otp, password);
      console.log('📝 Server response:', res);

      // Xử lý kết quả
      if (res && typeof res === 'object') {
        message.destroy(key);

        if (res.EC === 0) {
          // Thành công
          notification.success({
            message: 'Đặt lại mật khẩu thành công',
            description: 'Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.',
            duration: 3
          });
          
          // Clear form và chuyển hướng
          form.resetFields();
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } else {
          // Xử lý các loại lỗi
          let errorMessage;
          switch (res.EC) {
            case 1:
              errorMessage = 'Mã OTP không chính xác. Vui lòng kiểm tra lại.';
              break;
            case 2:
              errorMessage = 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
              setTimeout(() => {
                navigate('/forgot-password');
              }, 2000);
              break;
            case 3:
              errorMessage = 'Email không tồn tại trong hệ thống.';
              break;
            default:
              errorMessage = res.EM || 'Có lỗi xảy ra trong quá trình đặt lại mật khẩu.';
          }

          notification.error({
            message: 'Không thể đặt lại mật khẩu',
            description: errorMessage
          });
        }
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      message.destroy('resetPassword');
      
      notification.error({
        message: 'Lỗi hệ thống',
        description: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
        duration: 4
      });
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Đặt lại mật khẩu</h2>
        <p className="reset-password-subtitle">
          Nhập mã OTP đã được gửi đến email của bạn và mật khẩu mới
        </p>
        
        <Form
          form={form}
          name="reset"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Nhập email của bạn"
            />
          </Form.Item>

          <Form.Item
            label="Mã OTP"
            name="otp"
            rules={[
              { validator: validateOtp }
            ]}
            extra="Mã OTP có 6 chữ số đã được gửi đến email của bạn"
          >
            <Input 
              prefix={<KeyOutlined className="site-form-item-icon" />}
              placeholder="Nhập mã OTP 6 chữ số"
              maxLength={6}
              type="number"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[
              { validator: validatePassword }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <div className="password-requirements">
            <strong>Yêu cầu mật khẩu:</strong>
            <ul>
              <li>Ít nhất 6 ký tự</li>
              <li>Nên bao gồm chữ hoa, chữ thường và số</li>
              <li>Không nên sử dụng thông tin cá nhân dễ đoán</li>
            </ul>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>

        <div className="back-to-login">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;



