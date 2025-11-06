import React, { useMemo, useState } from 'react';
import { Button, Col, Divider, Form, Input, Row, Steps, Select, notification } from 'antd';
import { createUserApi, sendRegisterOtpApi, verifyRegisterOtpAndCreateUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, IdcardOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import '../styles/register.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const [step1ValuesState, setStep1ValuesState] = useState(null);
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [mockOtp, setMockOtp] = useState('');

  const roleOptions = useMemo(() => ([
    { label: 'Khách hàng', value: 'customer' },
    { label: 'Quản trị viên', value: 'admin' }
  ]), []);

  const handleSubmitStep1 = async (values) => {
    setLoading(true);
    try {
      // persist step1 values because the form will unmount when moving to step 2
      setStep1ValuesState(values);
      let proceeded = false;
      try {
        const res = await sendRegisterOtpApi(values.email);
        if (res && res.EC === 0) {
          setEmailForOtp(values.email);
          setCurrentStep(1);
          notification.success({ message: 'GỬI OTP', description: 'Đã gửi mã OTP qua email' });
          proceeded = true;
        }
      } catch (e) {
        console.error('[Register] sendRegisterOtpApi error', e);
        // ignore to allow fallback below
      }

      if (!proceeded) {
        // Fallback: chưa có API -> tạo OTP giả lập để test luồng
        const generated = Math.floor(100000 + Math.random() * 900000).toString();
        setMockOtp(generated);
        setEmailForOtp(values.email);
        setStep1ValuesState(values);
        setCurrentStep(1);
        notification.warning({
          message: 'GỬI OTP (DEV)',
          description: `Backend chưa có route. OTP tạm thời: ${generated}`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValues) => {
    // Prefer stored step1 values (form instance may be unmounted). Fall back to reading form fields.
    const step1Values = step1ValuesState || form.getFieldsValue();
    const  payload = {
      firstName: step1Values?.firstName,
      lastName: step1Values?.lastName,
      email: step1Values?.email,
      phone: step1Values?.phone,
      password: step1Values?.password,
      role: step1Values?.role,
      otp: otpValues.otp
    };

    console.log('[Register] verify payload', payload);
    setLoading(true);
    try {
      // Thử verify OTP qua backend nếu có
      let res = await verifyRegisterOtpAndCreateUserApi(payload);
      if (!(res && res.EC === 0)) {
        // Nếu backend chưa có, dùng OTP giả lập để kiểm tra
        if (mockOtp && (otpValues.otp === mockOtp)) {
          const name = `${payload.lastName ?? ''} ${payload.firstName ?? ''}`.trim();
          res = await createUserApi(name, payload.email, payload.password);
        }
      }

      if (res && (res.EC === 0 || res.access_token || res.message)) {
        notification.success({ message: 'ĐĂNG KÝ', description: 'Đăng ký thành công, vui lòng đăng nhập.' });
        navigate('/login');
      } else {
        notification.error({ message: 'ĐĂNG KÝ', description: 'OTP không hợp lệ hoặc chưa hỗ trợ. Vui lòng thử lại.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Đăng Ký</h2>

        <Steps
          size="small"
          current={currentStep}
          items={[
            { title: 'Thông tin', icon: <UserOutlined /> },
            { title: 'Xác thực OTP', icon: <SafetyCertificateOutlined /> }
          ]}
        />

        {currentStep === 0 && (
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmitStep1}
            autoComplete="off"
            className="register-form"
          >
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="Họ"
                  name="lastName"
                  rules={[{ required: true, message: 'Vui lòng nhập Họ' }]}
                >
                  <Input prefix={<IdcardOutlined />} placeholder="Nhập họ của bạn" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên"
                  name="firstName"
                  rules={[{ required: true, message: 'Vui lòng nhập Tên' }]}
                >
                  <Input prefix={<IdcardOutlined />} placeholder="Nhập tên của bạn" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Vui lòng nhập email' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại của bạn" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Vai trò"
              name="role"
              initialValue={roleOptions[0].value}
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select options={roleOptions} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Tiếp tục
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <Form
            layout="vertical"
            form={otpForm}
            onFinish={handleVerifyOtp}
            onFinishFailed={() => notification.error({ message: 'XÁC THỰC OTP', description: 'Vui lòng kiểm tra lại thông tin' })}
            autoComplete="off"
            className="register-form"
            initialValues={{ email: emailForOtp }}
          >
            <Form.Item label="Email" name="email">
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>

            <Form.Item
              label="Mã OTP"
              name="otp"
              rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }]}
            >
              <Input placeholder="Nhập mã gồm 6 số" maxLength={6} />
            </Form.Item>

            <Row gutter={10}>
              <Col span={12}>
                <Button
                  htmlType="button"
                  block
                  onClick={async () => {
                    const email = emailForOtp || otpForm.getFieldValue('email');
                    if (!email) {
                      notification.error({ message: 'GỬI LẠI OTP', description: 'Không có email để gửi lại OTP' });
                      return;
                    }
                    setLoading(true);
                    try {
                      const res = await sendRegisterOtpApi(email);
                      if (res && res.EC === 0) {
                        notification.success({ message: 'GỬI LẠI OTP', description: 'Đã gửi lại mã OTP' });
                      } else {
                        // Fallback regenerate OTP mock
                        const generated = Math.floor(100000 + Math.random() * 900000).toString();
                        setMockOtp(generated);
                        notification.warning({ message: 'GỬI LẠI OTP (DEV)', description: `OTP tạm thời: ${generated}` });
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Gửi lại OTP
                </Button>
              </Col>
              <Col span={12}>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Xác thực & Đăng ký
                </Button>
              </Col>
            </Row>
          </Form>
        )}

        <Divider />
        <div className="register-links">
          <Link to={'/'}><ArrowLeftOutlined /> Quay lại trang chủ</Link>
          <Link to={'/login'}>Đã có tài khoản? Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;