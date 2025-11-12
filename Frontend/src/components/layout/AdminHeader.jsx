import React, { useContext } from 'react';
import { Avatar, Menu, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import '../../styles/adminHeader.css';

const AdminHeader = ({ height = 64 }) => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  const user = auth?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || '';

  const handleLogout = () => {
    // remove only auth-related keys
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
    navigate('/');
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="admin-header" style={{ height }}>
      <div className="admin-header-left">
        <div className="admin-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>LVShop</div>
      </div>

      <div className="admin-header-right">
        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar className="admin-avatar" size="large" icon={<UserOutlined />} />
            <span className="admin-username">{user?.name || user?.email || ''}</span>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminHeader;
