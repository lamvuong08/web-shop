import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "./components/layout/header";
import axios from "./util/axios.customize";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import UserProfile from "./pages/user/profile";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import User from "./pages/admin/User";

// Layout
import AdminLayout from "./components/layout/AdminLayout";

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await axios.get("/v1/api/user");
        if (res && res.message) {
          // Save user info to localStorage
          localStorage.setItem('user', JSON.stringify({
            email: res.email,
            name: res.name,
            role: res.role
          }));

          setAuth({
            isAuthenticated: true,
            user: {
              email: res.email,
              name: res.name,
              role: res.role
            }
          });
        }
      } catch (error) {
        // If API call fails, try to get user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setAuth({
            isAuthenticated: true,
            user: {
              email: user.email,
              name: user.name,
              role: user.role
            }
          });
        }
      } finally {
        setAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // Protect Route Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return <Navigate to="/login" />;
    
    const user = JSON.parse(userStr);
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <div>
      {appLoading ? (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          <Spin />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Header />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="sale" element={<div>Sale Page</div>} />
            <Route path="men" element={<div>Men's Collection</div>} />
            <Route path="women" element={<div>Women's Collection</div>} />
            <Route path="about" element={<div>About Us</div>} />
            <Route path="contact" element={<div>Contact Us</div>} />
          </Route>

          {/* Auth Routes (No Header) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Customer Routes */}
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={["customer", "admin"]}>
              <Header />
              <Outlet />
            </ProtectedRoute>
          }>
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<User />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <>
              <Header />
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>404 - Không tìm thấy trang</h1>
              </div>
            </>
          } />
        </Routes>
      )}
    </div>
  );
}

export default App;