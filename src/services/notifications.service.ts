import { StorageKeys } from "@/utils/constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { StorageService } from "./storage.service";

// Controls how notifications behave when app is in foreground
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export async function registerForPushNotifications(): Promise<string | null> {
	if (!Device.isDevice) {
		console.warn("Must use a physical device for push notifications");
		return null;
	}

	// Request permissions
	const { status: existingStatus } =
		await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") {
		console.warn("Notification permission denied");
		return null;
	}

	// Android channel setup
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#5140E8",
		});
	}

	// Get the FCM/APNs token via Expo
	// const projectId = Constants.expoConfig?.extra?.eas?.projectId;
	// const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
	// 	.data;

	// For raw FCM token (needed for your own backend):
	const fcmToken = (await Notifications.getDevicePushTokenAsync()).data;

	const existintoken = await StorageService.getItemSecure(
		StorageKeys.FIREBASE_TOKEN,
		false,
	);

	if (!existintoken)
		await StorageService.setItemSecure(
			StorageKeys.FIREBASE_TOKEN,
			fcmToken,
		);

	return fcmToken; // send this to your NestJS backend
}
