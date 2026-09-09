import axios from 'axios';

const server = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: server,
    withCredentials: true, // Crucial for sending/receiving cookies
});

// Optional: Add request interceptor to attach token from localStorage if cookie is blocked
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Attach token to GET request params
        if (config.method === 'get') {
            config.params = {
                token: token,
                ...config.params
            };
        } else {
            // Attach token to POST, PUT, DELETE request body
            // Only if it's a plain object (not FormData)
            if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
                config.data = {
                    token: token,
                    ...config.data
                };
            } else if (!config.data) {
                // If no data, initialize it with token
                config.data = { token };
            }
            
            // Also add to params just in case the backend expects it there for non-GET
            config.params = {
                token: token,
                ...config.params
            };
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
