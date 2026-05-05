import api from "@/services/api";

export const notificationsService = {
	getLatestNotifications: async () => {
		try {
			const response = await api.get(
				"/api/v1/notifications/get-last-five-user-notifications",
			);
			return response.data;
		} catch (error: any) {
			console.error(error);
		}
	},

	getUserNotifications: async () => {
		try {
			const response = await api.get(
				"/api/v1/notifications/get-user-notifications",
			);
			// console.log(response.data);
			return response.data;
		} catch (error: any) {
			console.error(error);
		}
	},

	markNotificationAsRead: async (notificationId: string) => {
		try {
			const response = await api.patch(
				`/api/v1/notifications/mark-as-read/${notificationId}`,
			);
			console.log(response.data);
			return response.data;
		} catch (error: any) {
			console.error(error);
		}
	},
};
