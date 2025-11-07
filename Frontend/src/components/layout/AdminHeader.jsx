import React, { useContext } from 'react';
import { Avatar, Menu, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import '../../styles/adminHeader.css';

const AdminHeader = ({ height = 64 }) => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  // Try to get user from context first, fallback to localStorage
  const user = auth?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || '';

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
    navigate('/');
  };

  const menu = (
    <Menu>
      {role === 'admin' ? (
        <>
          <Menu.Item key="admin" onClick={() => navigate('/admin/dashboard')}>
            Trang quản lý
          </Menu.Item>
        </>
      ) : (
        <Menu.Item key="profile" onClick={() => navigate('/user/profile')}>
          Hồ sơ của tôi
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="admin-header" style={{ height }}>
      <div className="admin-header-left">
        <div className="admin-brand">LVShop</div>
      </div>

      <div className="admin-header-right">
        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <div style={{ cursor: 'pointer' }}>
            <Avatar className="admin-avatar" size="large" icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminHeader;
