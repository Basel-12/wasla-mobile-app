import i18n from '@/i18n/i18n';
import { StorageKeys } from '@/utils/constants';
import axios from 'axios';
import { router } from 'expo-router';
import { StorageService } from './storage.service';

const api = axios.create({
    baseURL: 'https://api.vocalaid.app',
    // baseURL: 'http://192.168.112.1:5000',
    timeout: 10000, // Optional: Set a timeout for requests
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await StorageService.getItemSecure(StorageKeys.TOKEN, false);
    if (token) {
        console.log('token', token);
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = i18n.language;
    return config;
});

let isRefreshing = false;
let failedQueue: {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}[] = [];

// while a refresh is in flight, queue all other 401 requests
// once refresh succeeds, retry them all with the new token
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(token!);
    });
    failedQueue = [];
};

const logout = async () => {
    await StorageService.removeItem(StorageKeys.TOKEN);
    await StorageService.removeItem(StorageKeys.REFRESH_TOKEN);
    router.dismissAll();
    router.replace('/(auth)/login');
};

// response interceptor — handle 401
api.interceptors.response.use(
    (response) => response, // pass through successful responses
    async (error) => {
        const originalRequest = error.config;

        // not a 401 or already retried → just reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        const skipRefreshUrls = [
            'api/v1/auth/login',
            'api/v1/auth/refresh-token',
        ];

        const isAuthRoute = skipRefreshUrls.some((url) =>
            originalRequest.url?.includes(url),
        );
        if (isAuthRoute) {
            return Promise.reject(error);
        }

        // a refresh is already in flight → queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = await StorageService.getItemSecure(
                StorageKeys.REFRESH_TOKEN,
                false,
            );

            if (!refreshToken) {
                await logout();
                return Promise.reject(error);
            }

            const { data } = await api.post('api/v1/auth/refresh-token', {
                refresh_token: refreshToken,
            });

            const { access_token, refresh_token } = data.data;

            // persist new tokens
            await StorageService.setItemSecure(StorageKeys.TOKEN, access_token);
            await StorageService.setItemSecure(
                StorageKeys.REFRESH_TOKEN,
                refresh_token,
            );

            // retry queued requests with new token
            processQueue(null, access_token);

            // retry original request
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
        } catch (refreshError) {
            // refresh failed → logout
            processQueue(refreshError, null);
            await logout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default api;
