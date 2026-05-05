import CustomHeader from "@/components/CustomHeader";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationCardSkeleton from "../components/cards/NotificationCardSkeleton";
import NotificationCard from "../components/notifications/NotificationCard";
import NotificationDetailSheet from "../components/notifications/NotificationDetailSheet";
import { notificationsService } from "../services/notifications.services";

export default function NotificationsScreen() {
	const { t } = useTranslation();
	const [notifications, setNotifications] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [refreshing, setRefreshing] = useState(false);
	const [selectedNotification, setSelectedNotification] = useState<any>(null);

	const loadNotifications = async () => {
		try {
			setRefreshing(true);
			const notifications =
				await notificationsService.getUserNotifications();
			setNotifications(notifications.data);
		} catch (error: any) {
			console.error(error);
		} finally {
			setRefreshing(false);
			setIsLoading(false);
		}
	};

	const markAsRead = async (notificationId: number) => {
		try {
			console.log("notificationId", notificationId);
			const response = await notificationsService.markNotificationAsRead(
				notificationId.toString(),
			);
			if (response.success) {
				setNotifications(
					notifications.map((notification) =>
						notification.id === notificationId
							? { ...notification, isRead: true }
							: notification,
					),
				);
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	useEffect(() => {
		const getNotifications = async () => {
			const notifications =
				await notificationsService.getUserNotifications();
			setNotifications(notifications.data);
			setIsLoading(false);
		};
		getNotifications();
	}, []);
	return (
		<SafeAreaView className="flex-1">
			<CustomHeader
				title={t("home.notifications.title")}
				showBackButton={true}
				onBackPress={() => router.back()}
			/>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					flexDirection: "column",
					gap: 16,
					padding: 16,
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={loadNotifications}
						colors={["#5140E8"]}
						progressBackgroundColor="#f6f6f8"
						progressViewOffset={10}
					/>
				}
			>
				{isLoading ? (
					Array.from({ length: 10 }).map((_, index) => (
						<NotificationCardSkeleton key={index} />
					))
				) : notifications.length > 0 ? (
					notifications.map((notification, index) => (
						<NotificationCard
							key={index}
							notification={notification.notification}
							id={notification.id}
							markAsRead={markAsRead}
							time={notification.createdAt}
							isRead={notification.isRead}
							onPress={() =>
								setSelectedNotification(notification.notification as any)
							}
						/>
					))
				) : (
					<Text className="text-center text-gray-500 text-sm">
						No notifications found
					</Text>
				)}
			</ScrollView>
			<NotificationDetailSheet
				notification={selectedNotification}
				onClose={() => setSelectedNotification(null)}
				time={selectedNotification?.createdAt}
			/>
		</SafeAreaView>
	);
}
