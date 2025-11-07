import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, Form, Input, notification, Tag } from 'antd';
import { getAllUsersApi, createUserCrudApi, updateUserApi, deleteUserApi } from '../../util/api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsersApi();
            if (response?.data) {
                setUsers(response.data);
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
        setModalVisible(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setModalVisible(true);
    };

    const handleDelete = (userId) => {
        confirm({
            title: 'Bạn có chắc chắn muốn xóa người dùng này?',
            icon: <ExclamationCircleOutlined />,
            content: 'Hành động này không thể hoàn tác',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await deleteUserApi(userId);
                    if (res && res.EC === 0) {
                        notification.success({
                            message: 'Thành công',
                            description: 'Xóa người dùng thành công'
                        });
                        fetchUsers();
                    } else {
                        notification.error({
                            message: 'Lỗi',
                            description: res?.EM || 'Không thể xóa người dùng'
                        });
                    }
                } catch (error) {
                    notification.error({
                        message: 'Lỗi',
                    });
                }
            }
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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
                    <Button type="primary" onClick={() => handleEdit(record)}>
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
            if (editingUser) {
                await updateUserApi(editingUser.id, values);
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật người dùng thành công'
                });
            } else {
                await createUserCrudApi(values);
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
                <h2 style={{ margin: 0 }}>Quản lý người dùng</h2>
                <Button type="primary" onClick={handleCreate}>
                    Thêm người dùng mới
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
                    <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input />
                    </Form.Item>

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
        </div>
    );
};

export default User;