import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

export function useNotificationListeners() {
	const notificationListener = useRef<any>(null);
	const responseListener = useRef<any>(null);

	useEffect(() => {
		// Fired when notification is received while app is open
		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log("Notification received:", notification);
			});

		// Fired when user taps on a notification
		responseListener.current =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					const data = response.notification.request.content.data;
					// Navigate based on data payload
					console.log("Notification tapped:", data);
				},
			);

		return () => {
            notificationListener.current?.remove();
			responseListener.current?.remove();
		};
	}, []);
}
