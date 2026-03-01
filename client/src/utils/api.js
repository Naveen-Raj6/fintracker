import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for Auth Token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor for Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return Promise.reject(message);
    }
);

export default api;
