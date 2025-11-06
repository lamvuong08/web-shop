import React, { useContext } from 'react';
import { Button, Divider, Form, Input, notification } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import '../styles/login.css'; // 👈 thêm file CSS riêng

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const onFinish = async (values) => {
    const { email, password } = values;
    const res = await loginApi(email, password);

    if (res && res.EC === 0) {
      localStorage.setItem('access_token', res.access_token);
      notification.success({
        message: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay lại!',
      });

      setAuth({
        isAuthenticated: true,
        user: {
          email: res?.user?.email ?? '',
          name: res?.user?.name ?? '',
        },
      });

      navigate('/');
    } else {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: res?.EM ?? 'Vui lòng kiểm tra lại thông tin!',
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Đăng Nhập</h2>

        <Form name="basic" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="login-links">
          <Link to="/">
            <ArrowLeftOutlined /> Quay lại trang chủ
          </Link>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <Divider />
        <div className="register-text">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
