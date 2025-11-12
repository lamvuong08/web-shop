import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, notification } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, OrderedListOutlined } from '@ant-design/icons';
import { getDashboardStatsApi } from '../../util/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await getDashboardStatsApi();
            if (response?.data) {
                setStats(response.data);
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải dữ liệu thống kê'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{  marginTop: '24px', marginBottom: '24px' }}>Tổng quan</h2>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số người dùng"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số sản phẩm"
                            value={stats.totalProducts}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số đơn hàng"
                            value={stats.totalOrders}
                            prefix={<OrderedListOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu"
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;