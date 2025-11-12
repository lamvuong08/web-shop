import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "./components/layout/header";
import axios from "./util/axios.customize";
import { useContext, useEffect, useState } from "react";
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
import AdminProfile from "./pages/admin/Profile";

// Layout
import AdminLayout from "./components/layout/AdminLayout";

function App() {
  const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await axios.get("/v1/api/user");
        console.debug('[App] fetchAccount response:', res);
        // axios.customize returns response.data on success and error.response.data on error
        const me = res?.data ?? res;
        // consider it a valid user only when we have an email (or name/role)
        if (me && (me.email || me.name || me.role)) {
          // Save user info to localStorage
          localStorage.setItem('user', JSON.stringify({
            email: me.email,
            name: me.name,
            role: me.role
          }));

          setAuth({
            isAuthenticated: true,
            user: {
              email: me.email,
              name: me.name,
              role: me.role
            }
          });
        } else {
          console.debug('[App] fetchAccount: no user data returned, treating as not authenticated', me);
        }
      } catch (error) {
        console.debug('[App] fetchAccount error:', error);
        // If API call fails, do NOT assume localStorage user means authenticated.
        // Clear any stale auth artifacts to avoid showing logged-in UI when token is invalid/expired.
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
      } finally {
        setAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // Protect Route Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
      let mounted = true;
      const check = async () => {
        // If auth already set in context (e.g. immediately after login), use it to decide
        if (auth?.isAuthenticated) {
          const user = auth.user || JSON.parse(localStorage.getItem('user') || 'null');
          if (user && allowedRoles.includes(user.role)) {
            setAllowed(true); setChecking(false); return;
          }
          if (user) { setAllowed('home'); setChecking(false); return; }
        }
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (!token) {
          if (mounted) {
            setAllowed(false);
            setChecking(false);
          }
          return;
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (allowedRoles.includes(user.role)) {
            if (mounted) { setAllowed(true); setChecking(false); }
          } else {
            if (mounted) { setAllowed('home'); setChecking(false); }
          }
          return;
        }

        // no user in localStorage but have token — fetch current user
        try {
          console.debug('[ProtectedRoute] token found, fetching /v1/api/user');
          const res = await axios.get('/v1/api/user');
          console.debug('[ProtectedRoute] /v1/api/user response:', res);
          const me = res?.data ?? res;
          // treat as valid only if we have an email/name/role
          if (me && (me.email || me.name || me.role)) {
            const user = { email: me.email, name: me.name, role: me.role };
            localStorage.setItem('user', JSON.stringify(user));
            setAuth({ isAuthenticated: true, user });
            if (allowedRoles.includes(user.role)) {
              if (mounted) { setAllowed(true); setChecking(false); }
            } else {
              if (mounted) { setAllowed('home'); setChecking(false); }
            }
          } else {
            console.debug('[ProtectedRoute] /v1/api/user returned invalid data:', res);
            // couldn't get user
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
            if (mounted) { setAllowed(false); setChecking(false); }
          }
        } catch (err) {
          console.debug('[ProtectedRoute] /v1/api/user fetch error:', err);
          // invalid token or network error -> treat as not authenticated
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
          if (mounted) { setAllowed(false); setChecking(false); }
        }
      };
      check();
      return () => { mounted = false; };
    }, [allowedRoles, setAuth]);

    if (checking) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      );
    }

    if (allowed === false) return <Navigate to="/login" />;
    if (allowed === 'home') return <Navigate to="/" />;
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
              <Header showOutlet={false} />
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
            <Route path="profile" element={<AdminProfile />} />
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