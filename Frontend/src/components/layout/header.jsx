import React, { useContext, useState } from 'react';
import { HomeOutlined, UserOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import '../../styles/header.css';

const Header = ({ showOutlet = true }) => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [current, setCurrent] = useState('home');

    // authentication state is available via AuthContext

    const onClick = (e) => setCurrent(e.key);

    // --- MENU CHÍNH ---
    const menuItems = [
        { label: <Link to="/">Trang chủ</Link>, key: 'home', icon: <HomeOutlined /> },
        { label: <Link to="/sale">Sale</Link>, key: 'sale' },
        { label: <Link to="/men">Nam</Link>, key: 'men' },
        { label: <Link to="/women">Nữ</Link>, key: 'women' },
        { label: <Link to="/about">Về chúng tôi</Link>, key: 'about' },
        { label: <Link to="/contact">Liên hệ</Link>, key: 'contact' },
    ];

    const getDashboardPath = (role) => {
        switch (role) {
            case "admin":
                return "/admin/dashboard";
            case "customer":
                return "/user/profile";
            default:
                return "/";
        }
    };

    // --- MENU DROPDOWN CỦA ICON NGƯỜI DÙNG ---
    const userMenu = (
        <Menu>
            {auth.isAuthenticated ? (
                <>
                    {auth.user?.role === "admin" ? (
                        <>
                            <Menu.Item key="admin">
                                <Link to="/admin/dashboard">Trang quản lý</Link>
                            </Menu.Item>
                            <Menu.Item key="profile">
                                <Link to="/user/profile">Hồ sơ của tôi</Link>
                            </Menu.Item>
                        </>
                    ) : (
                        <Menu.Item key="profile">
                            <Link to="/user/profile">Hồ sơ của tôi</Link>
                        </Menu.Item>
                    )}
                    <Menu.Item
                        key="logout"
                        onClick={() => {
                            localStorage.clear();
                            setCurrent('home');
                            setAuth({ isAuthenticated: false, user: { email: "", name: "", role: "" } });
                            navigate("/");
                        }}
                    >
                        Đăng xuất
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item key="login">
                    <Link to="/login">Đăng nhập</Link>
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <>
            <div className="header-container">
                {/* LOGO */}
                <div className="header-left" onClick={() => navigate('/')}>
                    <h1 className="header-title">LVShop</h1>
                </div>

                {/* MENU CHÍNH */}
                <div className="header-center">
                    <Menu
                        onClick={onClick}
                        selectedKeys={[current]}
                        mode="horizontal"
                        items={menuItems}
                    />
                </div>

                {/* ICON TÌM KIẾM + USER + GIỎ HÀNG */}
                <div className="header-right">
                    <SearchOutlined className="header-icon" onClick={() => alert('Đang suy nghĩ')} />
                    <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                        <UserOutlined className="header-icon" />
                    </Dropdown>
                    <ShoppingCartOutlined className="header-icon" onClick={() => alert('Giỏ hàng chưa làm tới')} />
                </div>
            </div>
            {showOutlet && <Outlet />}
        </>
    );
};

export default Header;
