import React, { useContext, useEffect, useState } from 'react';
import { Card, Form, Input, Button, notification, Descriptions, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AuthContext } from '../../components/context/auth.context';
import { getUserApi, updateUserApi } from '../../util/api';

const UserProfile = () => {
    const [form] = Form.useForm();
    const { auth } = useContext(AuthContext);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserApi();
                if (response) {
                    setUserInfo(response);
                    form.setFieldsValue({
                        name: response.name,
                        email: response.email,
                        phone: response.phone
                    });
                }
            } catch (error) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải thông tin người dùng'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await updateUserApi(userInfo.id, values);
            
            if (response && response.EC === 0) {
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật thông tin thành công'
                });
                setUserInfo(prev => ({ ...prev, ...values }));
            } else {
                throw new Error(response?.EM || 'Có lỗi xảy ra');
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: error.message || 'Không thể cập nhật thông tin'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
            <Card title="Hồ sơ của tôi" loading={loading}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar size={100} icon={<UserOutlined />} />
                </div>

                <Descriptions title="Thông tin tài khoản" bordered>
                    <Descriptions.Item label="Email">{userInfo?.email}</Descriptions.Item>
                    <Descriptions.Item label="Vai trò">
                        {userInfo?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </Descriptions.Item>
                </Descriptions>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ marginTop: 24 }}
                >
                    <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Cập nhật thông tin
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default UserProfile;