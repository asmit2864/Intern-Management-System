import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Interceptor to handle global unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthMe = error.config?.url?.endsWith('/auth/me');
        const isLoginPage = window.location.pathname === '/login';

        if (error.response?.status === 401 && !isAuthMe && !isLoginPage) {
            // Only redirect if it's NOT the initial session check 
            // and we are NOT already on the login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
