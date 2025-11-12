import { createContext, useState } from 'react';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: {
        email: "",
        name: "",
        role: "",
    },
    appLoading: true,
});

export const AuthWrapper = (props) => {
    const [auth, setAuth] = useState(() => {
        // Khôi phục trạng thái auth từ localStorage khi component mount
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                return {
                    isAuthenticated: true,
                    user: {
                        email: user.email || "",
                        name: user.name || "",
                        role: user.role || "",
                    }
                };
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }
        return {
            isAuthenticated: false,
            user: {
                email: "",
                name: "",
                role: "",
            }
        };
    });

    const [appLoading, setAppLoading] = useState(true);

    return (
        <AuthContext.Provider value={{
            auth, setAuth, appLoading, setAppLoading
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}