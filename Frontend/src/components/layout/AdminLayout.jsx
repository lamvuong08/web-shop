import React from 'react';
import { Layout } from 'antd';
import Sidenav from '../Sidenav';
import AdminHeader from './AdminHeader';

const { Content, Sider } = Layout;

const AdminLayout = ({ children }) => {
    const headerHeight = 64; // px - adjust if your header CSS uses a different height

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sider sits under the fixed header */}
            <Sider
                width={250}
                style={{
                    overflow: 'auto',
                    height: `calc(100vh - ${headerHeight}px)`,
                    position: 'fixed',
                    left: 0,
                    top: headerHeight,
                }}
            >
                <Sidenav />
            </Sider>

            {/* Header fixed at the top across the full width */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <AdminHeader />
            </div>

            {/* Main content area: leave space for header and sider */}
            <Layout style={{ marginLeft: 250 }}>
                <Content style={{ marginTop: headerHeight + 24, margin: '24px 16px', padding: 24, background: '#fff' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;