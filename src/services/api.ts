import i18n from '@/i18n/i18n';
import axios from 'axios'

const api = axios.create({
    baseURL: 'https://api.vocalaid.app', 
    // baseURL: 'http://192.168.112.1:5000',
    timeout: 10000, // Optional: Set a timeout for requests
    headers: {
        "Content-Type": "application/json",
    }
})

api.interceptors.request.use((config)=>{
    //send token with every request if exists
    const token = "your-auth-token"; // Replace with actual token retrieval logic
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = i18n.language;
    return config;
})

export default api;

