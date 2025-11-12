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
            { key: '/admin/dashboard', label: 'Tổng quan', path: '/admin/dashboard', icon: <DashboardOutlined /> },
            { key: '/admin/users', label: 'Quản lý người dùng', path: '/admin/users', icon: <UserOutlined /> },
            { key: '/admin/profile', label: 'Hồ sơ', path: '/admin/profile', icon: <ProfileOutlined /> }
        ],
        user: [

        ],
    };

    const isAdminPath = pathname.startsWith('/admin');
    const menuItems = isAdminPath ? menuConfig.admin : (menuConfig[role] || menuConfig.user);

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