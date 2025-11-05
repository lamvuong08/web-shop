import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Input, Row, notification } from 'antd';
import { forgotPasswordApi } from '../util/api';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email } = values;
    const res = await forgotPasswordApi(email);
    if (res && res.EC === 0) {
      notification.success({ message: 'FORGOT PASSWORD', description: 'Đã gửi mã OTP qua email' });
      setSent(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 300);
    } else {
      notification.error({ message: 'FORGOT PASSWORD', description: res?.EM ?? 'error' });
    }
  };

  return (
    <Row justify={'center'} style={{ marginTop: '30px' }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset style={{ padding: '15px', margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend>Quên mật khẩu</legend>
          <Form name="forgot" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}> 
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Gửi yêu cầu</Button>
            </Form.Item>
          </Form>
          {sent && (
            <div style={{ marginTop: 10 }}>Vui lòng kiểm tra email để lấy mã OTP.</div>
          )}
        </fieldset>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;



