import React, { useContext, useState } from 'react';
import { HomeOutlined, UserOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import '../../styles/header.css';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [current, setCurrent] = useState('home');

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

    // --- MENU DROPDOWN CỦA ICON NGƯỜI DÙNG ---
    const userMenu = (
        <Menu>
            {auth.isAuthenticated ? (
                <Menu.Item
                    key="logout"
                    onClick={() => {
                        localStorage.clear("access_token");
                        setCurrent('home');
                        setAuth({ isAuthenticated: false, user: { email: "", name: "" } });
                        navigate("/");
                    }}
                >
                    Đăng xuất
                </Menu.Item>
            ) : (
                <Menu.Item key="login">
                    <Link to="/login">Đăng nhập</Link>
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <div className="header-container">
            {/* LOGO */}
            <div className="header-left" onClick={() => navigate('/')}>
                <h1 className="header-title">LVClothes</h1>
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
    );
};

export default Header;
