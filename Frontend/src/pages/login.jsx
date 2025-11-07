import React, { useContext } from 'react';
import { Button, Divider, Form, Input, notification } from 'antd';
import { loginApi, getAllUsersApi, getUserApi } from '../util/api';
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
  // login successful
      localStorage.setItem('access_token', res.access_token);
      notification.success({
        message: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay lại!',
      });

      // Determine role: prefer server-provided role. If missing, try to fetch current user (/v1/api/user)
      // retry a few times to allow backend to recognize token/session, then fallback to /users if necessary.
      let role = res?.user?.role ?? '';
      if (!role) {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        let attempts = 5;
        for (let i = 0; i < attempts && !role; i++) {
          try {
            const meRes = await getUserApi();
            const me = meRes?.data ?? meRes;
            if (me && typeof me === 'object') {
              if (Array.isArray(me)) {
                const matched = me.find(u => u.email === res.user.email || u.email === values.email);
                if (matched) role = matched.role || '';
              } else {
                role = me.role || '';
              }
            }
            if (!role) {
              // wait a bit before retrying
              await wait(300);
            }
          } catch (err) {
            // getUserApi attempt failed
            await wait(300);
          }
        }

        if (!role) {
          // final fallback: try listing all users (may be restricted on some servers)
          try {
            const allRes = await getAllUsersApi();
            
            const users = allRes?.data ?? allRes;
            if (Array.isArray(users)) {
              const matched = users.find(u => u.email === res.user.email || u.email === values.email);
              if (matched) {
                role = matched.role || '';
              }
            }
          } catch (err2) {
            // error fetching users for fallback
          }
        }
      }

      // Save user info to localStorage (including derived role)
      localStorage.setItem('user', JSON.stringify({
        email: res?.user?.email,
        name: res?.user?.name,
        role
      }));

      setAuth({
        isAuthenticated: true,
        user: {
          email: res?.user?.email ?? '',
          name: res?.user?.name ?? '',
          role: role ?? '',
        },
      });

  // Navigate based on user role
  navigate(role === 'admin' ? '/admin/dashboard' : '/', { replace: true });
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
