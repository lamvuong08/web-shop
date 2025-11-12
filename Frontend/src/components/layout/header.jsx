import React, { useContext, useState, useEffect } from 'react';
import { HomeOutlined, UserOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import '../../styles/header.css';

const Header = ({ showOutlet = true }) => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [current, setCurrent] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);

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
                <>
                    <Menu.Item key="login">
                        <Link to="/login">Đăng nhập</Link>
                    </Menu.Item>
                    <Menu.Item key="register">
                        <Link to="/register">Đăng Kí</Link>
                    </Menu.Item>
                </>
            )}
        </Menu>
    );

    useEffect(() => {
        try {
            const raw = localStorage.getItem('cart');
            if (!raw) return setCartCount(0);
            const cart = JSON.parse(raw);
            if (!cart) return setCartCount(0);
            if (typeof cart.totalQuantity === 'number') return setCartCount(cart.totalQuantity);
            if (Array.isArray(cart.items)) {
                const q = cart.items.reduce((s, it) => s + (it.quantity || it.qty || 0), 0);
                return setCartCount(q);
            }
            if (Array.isArray(cart)) return setCartCount(cart.length);
        } catch (err) {
            setCartCount(0);
        }
    }, []);

    return (
        <>
            <div className="header-container">
                {/* LOGO */}
                <div className="header-left" onClick={() => navigate('/')}>
                    <img src="/img/background_uteshop.png" alt="LVShop" className="header-logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <h1 className="header-title">LVShop</h1>
                </div>

                {/* SEARCH */}
                <div className="header-search">
                    <div className="search-box">
                        <SearchOutlined className="search-icon" onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery)}`)} />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
                        />
                    </div>
                </div>

                {/* CART + USER */}
                <div className="header-right">
                    <div className="cart-link" onClick={() => navigate('/cart')}>
                        <ShoppingCartOutlined className="header-icon" />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </div>

                    {auth?.isAuthenticated ? (
                        <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                            <div className="user-info">
                                <UserOutlined className="header-icon user-icon" />
                                <span className="user-name">{auth.user?.name || auth.user?.email}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="auth-link">Đăng nhập</Link>
                            <Link to="/register" className="auth-link">Đăng kí</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM MENU*/}
            <div className="header-bottom">
                <div className="bottom-inner">
                    {menuItems.map((it) => (
                        <div key={it.key} className="bottom-item">{it.label}</div>
                    ))}
                </div>
            </div>
            {showOutlet && <Outlet />}
        </>
    );
};

export default Header;
