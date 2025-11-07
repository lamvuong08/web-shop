import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Form, Input, notification,message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { forgotPasswordApi } from '../util/api';
import '../styles/forgot-password.css';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email } = values;
    try {
      // Hiển thị loading state
      const hide = message.loading('Đang xử lý... Vui lòng chờ trong giây lát...', 0);
      
      const res = await forgotPasswordApi(email);
      
      // Đóng loading notification
      hide();

      if (res && res.EC === 0) {
        notification.success({ 
          message: 'Gửi OTP thành công', 
          description: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã để tiếp tục.',
          duration: 5
        });
        setSent(true);
        // Chuyển đến trang reset password sau 1.5 giây
        setTimeout(() => {
          navigate('/reset-password', { 
            state: { 
              email,
              fromForgotPassword: true // Đánh dấu là đến từ forgot password
            } 
          });
        }, 1500);
      } else {
        notification.error({ 
          message: 'Gửi OTP thất bại', 
          description: res?.EM || 'Có lỗi xảy ra, vui lòng thử lại sau.',
          duration: 5
        });
      }
    } catch (error) {
      notification.error({ 
        message: 'Lỗi hệ thống', 
        description: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        duration: 5
      });
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Quên mật khẩu</h2>
        <p className="forgot-password-subtitle">
          Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
        </p>
        
        <Form
          name="forgot"
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

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Gửi mã OTP
            </Button>
          </Form.Item>
        </Form>

        {sent && (
          <div className="forgot-password-subtitle" style={{ marginTop: 10 }}>
            Vui lòng kiểm tra email để lấy mã OTP.
          </div>
        )}

        <div className="back-to-login">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;



