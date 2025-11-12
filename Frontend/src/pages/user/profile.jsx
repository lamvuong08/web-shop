import React from 'react';
import { Card, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const UserProfile = () => {
    return (
        <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
            <Card title="Hồ sơ của tôi">
                <div style={{ textAlign: 'center', margin: '40px 0' }}>
                    <Avatar size={100} icon={<UserOutlined />} />
                    <h2 style={{ marginTop: 20 }}>Chào mừng đến trang hồ sơ</h2>
                </div>
            </Card>
        </div>
    );
};

export default UserProfile;
