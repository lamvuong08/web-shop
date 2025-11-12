import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, Form, Input, notification, Tag, Select } from 'antd';
import { getAllUsersApi, createUserCrudApi, updateUserApi, deleteUserApi } from '../../util/api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsersApi();
            if (response?.data) {
                // normalize user data: ensure phone and split name into first/last for display
                const mapped = response.data.map((u) => {
                    const tokens = (u.name || '').trim().split(/\s+/).filter(Boolean);
                    const firstName = u.firstName || (tokens.length > 0 ? tokens[0] : '');
                    const lastName = u.lastName || (tokens.length > 1 ? tokens.slice(1).join(' ') : '');
                    return {
                        ...u,
                        phone: u.phone || u.phoneNumber || u.mobile || '',
                        firstName,
                        lastName,
                    };
                });
                setUsers(mapped);
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách người dùng'
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setEditingUser(null);
        form.resetFields();
        form.setFieldsValue({ role: 'customer' });
        setModalVisible(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        // split name into first / last when possible (first token = Họ, rest = Tên)
        const tokens = (user.name || '').trim().split(/\s+/).filter(Boolean);
        const ho = tokens.length > 0 ? tokens[0] : '';
        const ten = tokens.length > 1 ? tokens.slice(1).join(' ') : '';
        form.setFieldsValue({
            ...user,
            firstName: user.firstName || ho,
            lastName: user.lastName || ten,
            phone: user.phone || user.phoneNumber || user.mobile || '',
            role: user.role || 'customer'
        });
        setModalVisible(true);
    };

    const handleDelete = (userId) => {
        setUserToDelete(userId);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await deleteUserApi(userToDelete);
            if (res?.EC === 0) {
                notification.success({
                    message: 'Thành công',
                    description: res.EM || 'Xóa người dùng thành công'
                });
                fetchUsers();
            } else {
                console.error('Delete failed:', res);
                notification.error({
                    message: 'Lỗi',
                    description: res?.EM || 'Không thể xóa người dùng'
                });
            }
        } catch (error) {
            console.error('Delete user error:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Có lỗi xảy ra khi xóa người dùng'
            });
        } finally {
            setDeleteModalVisible(false);
            setUserToDelete(null);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Họ',
            dataIndex: 'firstName',
            key: 'firstName',
            render: (_, record) => {
                if (record.firstName) return record.firstName;
                const tokens = (record.name || '').trim().split(/\s+/).filter(Boolean);
                return tokens.length > 0 ? tokens[0] : '';
            }
        },
        {
            title: 'Tên',
            dataIndex: 'lastName',
            key: 'lastName',
            render: (_, record) => {
                if (record.lastName) return record.lastName;
                    const tokens = (record.name || '').trim().split(/\s+/).filter(Boolean);
                    return tokens.length > 1 ? tokens.slice(1).join(' ') : (tokens[0] || '');
            }
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone || ''
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'gold' : 'blue'}>
                    {role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="default" onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Button danger onClick={() => handleDelete(record.id)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const onFinish = async (values) => {
        try {
            // build payload: include firstName, lastName, phone, role, and name (combined)
            const payload = {
                ...values,
                firstName: values.firstName || '',
                lastName: values.lastName || '',
                phone: values.phone || '',
                role: values.role || 'customer',
            };
            // combine name for backward compatibility
            payload.name = `${payload.firstName || ''}${payload.firstName && payload.lastName ? ' ' : ''}${payload.lastName || ''}`.trim() || values.name || '';

            if (editingUser) {
                await updateUserApi(editingUser.id, payload);
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật người dùng thành công'
                });
            } else {
                await createUserCrudApi(payload);
                notification.success({
                    message: 'Thành công',
                    description: 'Tạo người dùng mới thành công'
                });
            }
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Có lỗi xảy ra khi lưu thông tin'
            });
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>Quản lý người dùng</h2>
                <Button type="primary" onClick={handleCreate}>
                    Thêm người dùng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Form.Item
                            name="firstName"
                            label="Họ"
                            rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                            style={{ flex: 1 }}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            label="Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            style={{ flex: 1 }}
                        >
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input disabled={!!editingUser} />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                        initialValue="customer"
                    >
                        <Select>
                            <Select.Option value="customer">Khách hàng</Select.Option>
                            <Select.Option value="admin">Quản trị viên</Select.Option>
                        </Select>
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: !editingUser, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginTop: 24 }}>
                        <Space style={{ float: 'right' }}>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: '#fa541c', fontSize: 24 }} />
                    <span>Xác nhận xóa</span>
                    </div>
                }
                open={deleteModalVisible}
                onOk={handleDeleteConfirm}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setUserToDelete(null);
                }}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, style: { minWidth: 80 } }}
                cancelButtonProps={{ style: { minWidth: 80 } }}
                centered
                bodyStyle={{ fontSize: 16, paddingTop: 12, textAlign: 'center' }}  // căn giữa text
                >
                <p>
                    Bạn có chắc chắn muốn xóa người dùng <strong>{users.find(u => u.id === userToDelete)?.name || ''}</strong> không?
                </p>
                <p style={{ color: '#888' }}>
                    Hành động này không thể hoàn tác.
                </p>
            </Modal>
        </div>
    );
};

export default User;