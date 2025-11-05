import React, { useEffect } from 'react';
import { Button, Col, Form, Input, Row, notification } from 'antd';
import { resetPasswordApi } from '../util/api';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const email = location?.state?.email;
    if (email) {
      form.setFieldsValue({ email });
    }
  }, [location, form]);

  const onFinish = async (values) => {
    const { email, otp, password } = values;
    const res = await resetPasswordApi(email, otp, password);
    if (res && res.EC === 0) {
      notification.success({ message: 'RESET PASSWORD', description: 'Đổi mật khẩu thành công' });
      setTimeout(() => navigate('/login'), 500);
    } else {
      notification.error({ message: 'RESET PASSWORD', description: res?.EM ?? 'error' });
    }
  };

  return (
    <Row justify={'center'} style={{ marginTop: '30px' }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset style={{ padding: '15px', margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend>Đặt lại mật khẩu</legend>
          <Form form={form} name="reset" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}> 
              <Input />
            </Form.Item>
            <Form.Item label="Mã OTP" name="otp" rules={[{ required: true, message: 'Please input OTP!' }]}> 
              <Input />
            </Form.Item>
            <Form.Item label="Mật khẩu mới" name="password" rules={[{ required: true, message: 'Please input password!' }]}> 
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Đặt lại</Button>
            </Form.Item>
          </Form>
        </fieldset>
      </Col>
    </Row>
  );
};

export default ResetPasswordPage;



