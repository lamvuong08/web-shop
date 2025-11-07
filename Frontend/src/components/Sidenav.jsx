import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    GlobalOutlined,
    ShoppingOutlined,
    CarOutlined,
    DatabaseOutlined,
    HomeOutlined,
    TeamOutlined,
    DollarOutlined,
    DropboxOutlined,
    SearchOutlined,
    UserOutlined,
    ShopOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    GiftOutlined,
    BarChartOutlined,
    ProfileOutlined,
    InboxOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    TruckOutlined,
    EnvironmentOutlined,
    BankOutlined,
} from '@ant-design/icons';
import './Sidenav.css';

const { SubMenu } = Menu;

const Sidenav = ({ color = 'light' }) => {
    const { pathname } = useLocation();

    // Lấy role từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role || 'user';

    // cấu hình menu theo role
    const menuConfig = {
        admin: [
            { key: '/admin/dashboard', label: 'Báo cáo & Thống kê', path: '/admin/dashboard', icon: <DashboardOutlined /> },
            { key: '/admin/users', label: 'Quản lý người dùng', path: '/admin/users', icon: <UserOutlined /> },
            { key: '/admin/profile', label: 'Hồ sơ', path: '/admin/profile', icon: <ProfileOutlined /> }
        ],
        user: [
            { key: '/user/profile', label: 'Hồ sơ cá nhân', path: '/user/profile', icon: <ProfileOutlined /> },
            { key: '/user/orders', label: 'Đơn hàng của tôi', path: '/user/orders', icon: <ShoppingCartOutlined /> },
            { key: '/', label: 'Về trang chủ', path: '/', icon: <HomeOutlined /> },
        ],
    };

    const menuItems = menuConfig[role] || menuConfig.user;

    // open submenu theo route
    const [openKeys, setOpenKeys] = useState([]);
    useEffect(() => {
        const keys = [];
        menuItems.forEach((item) => {
            if (item.children?.some((child) => child.key === pathname)) keys.push(item.key);
        });
        setOpenKeys(keys);
    }, [pathname]);

    return (
        <div className="sidenav">

            <Menu
                theme={color}
                mode="inline"
                selectedKeys={[pathname]}
                openKeys={openKeys}
                onOpenChange={(keys) => setOpenKeys(keys)}
                style={{ height: '100%', borderRight: 0 }}
            >
                {menuItems.map((item) =>
                    item.children ? (
                        <SubMenu key={item.key} icon={item.icon} title={item.label}>
                            {item.children.map((child) => (
                                <Menu.Item key={child.key} icon={child.icon}>
                                    <NavLink to={child.path || '#'}>{child.label}</NavLink>
                                </Menu.Item>
                            ))}
                        </SubMenu>
                    ) : (
                        <Menu.Item key={item.key} icon={item.icon}>
                            <NavLink to={item.path || '#'}>{item.label}</NavLink>
                        </Menu.Item>
                    )
                )}
            </Menu>
        </div>
    );
};

export default Sidenav;