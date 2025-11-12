import React, { useState, useContext, useEffect } from 'react';
import { Card, Form, Input, Button, notification, Modal, Typography, Tag } from 'antd';
import { 
    UserOutlined, 
    PhoneOutlined, 
    MailOutlined, 
    EditOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../components/context/auth.context';
import { getUserApi, updateUserApi } from '../../util/api';
import '../../styles/admin-profile.css';

const Profile = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [form] = Form.useForm();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getUserApi();
                console.debug('[Profile] getUserApi response:', response);
                let userData = response?.data ?? response;
                // If backend returns list (array), try to pick the current logged-in user by email
                if (Array.isArray(userData)) {
                    const email = auth?.user?.email;
                    if (email) {
                        const found = userData.find(u => u.email === email);
                        userData = found || userData[0] || null;
                    } else {
                        userData = userData[0] || null;
                    }
                }

                console.debug('[Profile] normalized userData:', userData);
                if (userData) {
                    // Tách họ tên
                    const tokens = (userData.name || '').trim().split(/\s+/).filter(Boolean);
                    const firstName = userData.firstName || (tokens.length > 0 ? tokens[0] : '');
                    const lastName = userData.lastName || (tokens.length > 1 ? tokens.slice(1).join(' ') : '');

                    form.setFieldsValue({
                        firstName,
                        lastName,
                        email: userData.email,
                        phone: userData.phone || ''
                    });

                    // keep local copy for display; avoid updating AuthContext here to prevent render loops
                    setCurrentUser(userData);
                }
            } catch (error) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải thông tin người dùng'
                });
            }
        };

        fetchUserData();
    }, []); // run once on mount

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                name: `${values.firstName}${values.firstName && values.lastName ? ' ' : ''}${values.lastName}`.trim()
            };
            
            const response = await updateUserApi(auth.user.id, payload);
            
            if (response?.EC === 0) {
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật thông tin thành công'
                });

                // Cập nhật context auth
                setAuth(prev => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        name: payload.name,
                        phone: payload.phone ?? prev.user?.phone
                    }
                }));
                // update local copy (if backend returned updated data include it)
                const updatedUser = response?.data || { ...(currentUser || {}), ...payload };
                setCurrentUser(updatedUser);
            } else {
                throw new Error(response?.EM || 'Cập nhật thất bại');
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: error.message || 'Có lỗi xảy ra khi cập nhật thông tin'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            notification.error({
                message: 'Lỗi',
                description: 'Mật khẩu mới và xác nhận mật khẩu không khớp'
            });
            return;
        }

        setLoading(true);
        try {
            // Thêm API changePassword ở đây
            notification.success({
                message: 'Thành công',
                description: 'Đổi mật khẩu thành công'
            });
            passwordForm.resetFields();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: error.message || 'Có lỗi xảy ra khi đổi mật khẩu'
            });
        } finally {
            setLoading(false);
        }
    };

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const { Text } = Typography;

    const showEditModal = () => {
        // populate form with current values before opening
        if (currentUser) {
            const tokens = (currentUser.name || '').trim().split(/\s+/).filter(Boolean);
            form.setFieldsValue({
                firstName: currentUser.firstName || (tokens.length > 0 ? tokens[0] : ''),
                lastName: currentUser.lastName || (tokens.length > 1 ? tokens.slice(1).join(' ') : ''),
                email: currentUser.email,
                phone: currentUser.phone || ''
            });
        }
        setIsEditModalVisible(true);
    };

    const handleCancel = () => {
        setIsEditModalVisible(false);
        form.resetFields();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    return (
        <div className="admin-profile">
            <div className="admin-profile-header">
                <div className="admin-profile-avatar">
                    <UserOutlined />
                </div>
                <h3 className="admin-profile-name">{(currentUser && currentUser.name) || auth.user.name}</h3>
                <div className="admin-profile-role-container">
                    <Tag className="role-tag">
                        Quản trị viên
                    </Tag>
                </div>
            </div>
            
            <Card className="admin-profile-info">
                <div className="info-item">
                    <span className="info-label">
                        <MailOutlined /> Email:
                    </span>
                    <span className="info-value">{auth.user.email}</span>
                </div>

                <div className="info-item">
                    <span className="info-label">
                        <PhoneOutlined /> Số điện thoại:
                    </span>
                    <span className="info-value">{(currentUser && currentUser.phone) || auth.user.phone || ''}</span>
                </div>

                <div className="info-item">
                    <span className="info-label">
                        <CheckCircleOutlined /> Trạng thái tài khoản:
                    </span>
                    <span className="info-value active">Đã xác thực</span>
                </div>

                <div className="info-item">
                    <span className="info-label">
                        <ClockCircleOutlined /> Hoạt động:
                    </span>
                    <span className="info-value active">Đang hoạt động</span>
                </div>

                    <Button 
                        type="primary"
                        className="edit-button"
                        onClick={showEditModal}
                    >
                        <EditOutlined /> Chỉnh sửa thông tin
                    </Button>
            </Card>

            <Modal
                title="Chỉnh sửa thông tin"
                open={isEditModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        handleUpdateProfile(values);
                        setIsEditModalVisible(false);
                    }}
                >
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="firstName"
                            label="Họ"
                            rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                            style={{ flex: 1 }}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Nhập họ" />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            label="Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            style={{ flex: 1 }}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Nhập tên" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="email"
                        label="Email"
                    >
                        <Input prefix={<MailOutlined />} disabled />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Cập nhật thông tin
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;