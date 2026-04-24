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
			console.log(error);
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

	verify: async (email: string, code: string) => {
		const response = await api.post("/api/v1/auth/verify-otp", {
			email,
			otp: code,
		});
		return response.data;
	},

	resendOtp: async (email: string, reason: string) => {
		const response = await api.post("/api/v1/auth/resend-otp", {
			email,
			reason,
		});
		return response.data;
	},

	forgetPassword: async (email: string) => {
		const response = await api.post("/api/v1/auth/forgot-password", {
			email,
		});
		return response.data;
	},

	verifyForgetPasswordOtp: async (email: string, otp: string) => {
		const response = await api.post("/api/v1/auth/verify-reset-otp", {
			email,
			otp,
		});
		return response.data;
	},

	resetPassword: async (reset_token: string, password: string) => {
		const response = await api.post("/api/v1/auth/reset-password", {
			reset_token,
			password,
		});
		return response.data;
	},
};
