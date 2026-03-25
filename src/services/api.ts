import axios from 'axios'

const api = axios.create({
    baseURL: 'https://api.gp.com', // Replace with your actual API base URL
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
    return config;
})

export default api;

