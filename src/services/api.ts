import i18n from "@/i18n/i18n";
import { StorageKeys } from "@/utils/constants";
import axios from "axios";
import { StorageService } from "./storage.service";

const api = axios.create({
	baseURL: "https://api.vocalaid.app",
	// baseURL: 'http://192.168.112.1:5000',
	timeout: 10000, // Optional: Set a timeout for requests
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(async (config) => {
	const token = await StorageService.getItemSecure(StorageKeys.TOKEN, false);
	if (token) {
		console.log("token", token);
		config.headers.Authorization = `Bearer ${token}`;
	}
	config.headers["Accept-Language"] = i18n.language;
	return config;
});

export default api;
