import api from './api';

export const verifyToken = async (token) => {
    console.log('Verifying token:', token ? token.substring(0, 20) + '...' : 'null');
    try {
        const response = await api.post('/auth/verify-token', { token });
        console.log('Verification response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Token verification error:', error);
        throw error;
    }
};

export const refreshToken = async () => {
    try {
        const response = await api.post('/auth/refresh-token', {}, {
            withCredentials: true,
            timeout: 10000
        });
        return response.data.accessToken;
    } catch (error) {
        throw new Error('SESSION_EXPIRED');
    }
};