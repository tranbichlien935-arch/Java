import api from './api';
import { mockAuthService } from './mockAuth';

const AUTH_ENDPOINT = '/auth';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const authService = {
    // Login with username and password
    login: async (username, password) => {
        // Use mock auth if enabled
        if (USE_MOCK) {
            const data = await mockAuthService.login(username, password);

            // Save token and user info to localStorage
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        }

        // Real API call
        try {
            const response = await api.post(`${AUTH_ENDPOINT}/login`, {
                username,
                password,
            });

            const data = response.data;
            console.log('Login response:', data); // DEBUG

            // Handle both 'token' and 'accessToken' from backend
            const token = data.accessToken || data.token;

            if (!token) {
                console.error('No token in response:', data);
                throw new Error('Login response missing token');
            }

            // Save token to localStorage
            localStorage.setItem('accessToken', token);

            // Create user object from response
            const user = {
                id: data.id,
                username: data.username,
                email: data.email,
                fullName: data.fullName,
                role: data.roles && data.roles.length > 0 ? data.roles[0] : null,
                roles: data.roles || []
            };

            localStorage.setItem('user', JSON.stringify(user));
            console.log('Login successful, user:', user); // DEBUG

            return { accessToken: token, user };
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Register new user
    register: async (userData) => {
        // Use mock auth if enabled
        if (USE_MOCK) {
            return await mockAuthService.register(userData);
        }

        // Real API call
        try {
            const response = await api.post(`${AUTH_ENDPOINT}/register`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    },

    // Get user role
    getUserRole: () => {
        const user = authService.getCurrentUser();
        return user?.role || null;
    },

    // Check if user has specific role
    hasRole: (role) => {
        const userRole = authService.getUserRole();
        return userRole === role;
    },

    // Check if user is admin
    isAdmin: () => {
        return authService.hasRole('ROLE_ADMIN');
    },

    // Check if user is teacher
    isTeacher: () => {
        return authService.hasRole('ROLE_TEACHER');
    },

    // Check if user is student
    isStudent: () => {
        return authService.hasRole('ROLE_STUDENT');
    },

    // Get access token
    getToken: () => {
        return localStorage.getItem('accessToken');
    },
};

export default authService;
