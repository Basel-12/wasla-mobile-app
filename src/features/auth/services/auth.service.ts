import api from "@/services/api";
export const authService = {
	login: async (email: string, password: string) => {
		try {
			const response = await api.post("/api/v1/auth/login", {
				email,
				password,
			});
			return response.data;
		} catch (error) {
			console.log(error)
			throw error;
		}
	},

	signup: async (name: string, email: string, password: string) => {
		const response = await api.post("/api/v1/auth/signup", {
			name,
			email,
			password,
		});
		return response.data;
	},

	verify: async (userId: string, code: string) => {
		const response = await api.post("/api/v1/auth/verify-otp", {
			userId,
			otp: code,
		});
		return response.data;
	},
};
