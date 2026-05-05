import { StorageKeys } from "@/utils/constants";
import * as Crypto from "expo-crypto";
import { StorageService } from "./storage.service";

export const deviceService = {
	getDeviceId: async () => {
		// await StorageService.removeItemSecure(StorageKeys.DEVICE_ID);
		// await StorageService.removeItemSecure(StorageKeys.FIREBASE_TOKEN);
		// await StorageService.removeItemSecure(StorageKeys.TOKEN);
		const deviceId = await StorageService.getItemSecure(
			StorageKeys.DEVICE_ID,
			false,
		);
		if (!deviceId) {
			const newDeviceId = Crypto.randomUUID();
			await StorageService.setItemSecure(
				StorageKeys.DEVICE_ID,
				newDeviceId.toString(),
			);
			return newDeviceId;
		}
		return deviceId;
	},
};
