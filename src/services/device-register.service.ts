import { StorageKeys } from "@/utils/constants";
import api from "./api";
import { deviceService } from "./device.service";
import { registerForPushNotifications } from "./notifications.service";
import { StorageService } from "./storage.service";

export const deviceRegisterService = {
	registerDevice: async (force = false) => {
		try {
			// ✅ read old values FIRST before anything writes to storage
			const [lastDeviceId, lastFirebaseToken] = await Promise.all([
				StorageService.getItemSecure(StorageKeys.DEVICE_ID, false),
				StorageService.getItemSecure(StorageKeys.FIREBASE_TOKEN, false),
			]);

			const deviceId = await deviceService.getDeviceId();
			const firebaseToken = await registerForPushNotifications();

			console.log("deviceId", deviceId);
			console.log("firebaseToken", firebaseToken);
			console.log("lastDeviceId", lastDeviceId);
			console.log("lastFirebaseToken", lastFirebaseToken);

			if (!force) {
				// ✅ guard against null firebaseToken
				if (!firebaseToken) {
					console.warn(
						"No firebase token available, skipping registration",
					);
					return;
				}
				const changed =
					lastDeviceId?.toString() !== deviceId?.toString() ||
					lastFirebaseToken?.toString() !== firebaseToken?.toString();
				console.log("changed", changed);
				if (!changed) return;
			}

			const response = await api.post(
				"/api/v1/users/set-firebase-token",
				{
					deviceId,
					firebaseToken,
				},
			);
			return response.data;
		} catch (error: any) {
			console.error(
				"registerDevice error:",
				error?.response?.status,
				error?.response?.data,
				error?.message,
			);
		}
	},
};
